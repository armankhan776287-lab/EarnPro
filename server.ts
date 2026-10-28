import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { storage, hashPassword, verifyPassword } from './server/storage.ts';

const app = express();
const PORT = 3000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'earnpro-secure-hmac-secret-key-2026';

app.use(express.json());

// Token helper (Stateless HMAC-SHA256 token)
function generateToken(userId: string, role: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${userId}.${role}.${expiresAt}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split('.');
    if (parts.length !== 4) return null;
    const [userId, role, expiresAtStr, sig] = parts;
    const payload = `${userId}.${role}.${expiresAtStr}`;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    if (sig !== expectedSig) return null;
    if (Number(expiresAtStr) < Date.now()) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    fullName: string;
    status: string;
  };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : (req.query.auth as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  const user = storage.findUserById(verified.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  if (user.status === 'blocked' || user.status === 'suspended') {
    return res.status(403).json({ error: `Account is ${user.status}. Please contact support.` });
  }

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
  };
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Administrative privileges required' });
    }
    next();
  });
}

// Rate-limiting memory map for auth endpoints
const rateLimitMap = new Map<string, { count: number; firstSeen: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.firstSeen > 60000) {
    rateLimitMap.set(ip, { count: 1, firstSeen: now });
    return next();
  }
  if (record.count >= 60) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }
  record.count++;
  next();
}

app.use('/api', rateLimiter);

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, referralCode } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existing = storage.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Auto-generate unique referral code
    const baseCode = fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'USER';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedReferralCode = `${baseCode}${randomSuffix}`;

    const { hash } = hashPassword(password);
    const newUser = storage.createUser({
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : undefined,
      role: 'user',
      status: 'active',
      emailVerified: true, // Auto-verified for frictionless onboarding
      referralCode: generatedReferralCode,
      referredBy: referralCode ? referralCode.trim().toUpperCase() : undefined,
    });

    const token = generateToken(newUser.id, newUser.role);
    const wallet = storage.getWallet(newUser.id);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.emailVerified,
        avatarUrl: newUser.avatarUrl,
        referralCode: newUser.referralCode,
        dailyStreak: newUser.dailyStreak,
        lastCheckinDate: newUser.lastCheckinDate,
      },
      wallet,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      return res.status(403).json({ error: `Your account is ${user.status}. Please contact support@earnpro.in` });
    }

    // Update last login
    storage.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const token = generateToken(user.id, user.role);
    const wallet = storage.getWallet(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
        dailyStreak: user.dailyStreak,
        lastCheckinDate: user.lastCheckinDate,
      },
      wallet,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo Quick Login Switcher (helpful for testing user vs admin flows instantly)
app.post('/api/auth/demo-switch', (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const targetEmail = role === 'admin' ? 'admin@earnpro.in' : 'rahul.sharma@example.com';
    const user = storage.findUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found' });
    }

    const token = generateToken(user.id, user.role);
    const wallet = storage.getWallet(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
        dailyStreak: user.dailyStreak,
        lastCheckinDate: user.lastCheckinDate,
      },
      wallet,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = storage.findUserByEmail(email);
  if (!user) {
    // Standard security: don't reveal if user exists
    return res.json({ message: 'If this email is registered, password reset instructions have been sent.' });
  }
  // Record notification
  storage.addNotification({
    userId: user.id,
    title: 'Password Reset Request',
    message: 'A password reset was requested. If you did not request this, please ensure your account is secure.',
    type: 'system',
  });
  return res.json({
    message: 'Password reset link sent! (In demo mode, you can reset your password directly using verification token: RESET-' + user.id.slice(-4) + ')',
    demoToken: `RESET-${user.id.slice(-4)}`,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid email, reset token, and password (min 6 characters) required' });
  }
  const user = storage.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Account not found' });
  }
  if (!token.startsWith('RESET-')) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const { hash } = hashPassword(newPassword);
  storage.updateUser(user.id, { passwordHash: hash });
  return res.json({ success: true, message: 'Password updated successfully. You can now login.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = storage.findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const wallet = storage.getWallet(user.id);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      referralCode: user.referralCode,
      dailyStreak: user.dailyStreak,
      lastCheckinDate: user.lastCheckinDate,
    },
    wallet,
  });
});

app.post('/api/auth/update-profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, avatarUrl } = req.body;
  const updated = storage.updateUser(req.user!.id, {
    fullName: fullName ? fullName.trim() : undefined,
    phone: phone ? phone.trim() : undefined,
    avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
  });
  return res.json({ success: true, user: updated });
});

// ----------------------------------------------------
// DASHBOARD & STATS
// ----------------------------------------------------
app.get('/api/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = storage.findUserById(userId);
  const wallet = storage.getWallet(userId);
  const transactions = storage.getTransactions(userId).slice(0, 5);
  const submissions = storage.getSubmissions(userId);
  const referrals = storage.getReferrals(userId);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = user?.lastCheckinDate === todayStr;

  const completedTasksCount = submissions.filter(s => s.status === 'approved').length;
  const pendingTasksCount = submissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length;

  res.json({
    wallet,
    stats: {
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
      dailyStreak: user?.dailyStreak || 0,
      hasCheckedInToday,
      referralCount: referrals.count,
      completedTasksCount,
      pendingTasksCount,
    },
    recentTransactions: transactions,
    appNotice: storage.getSettings().appNotice,
    dailyCheckinRewards: storage.getSettings().dailyCheckinRewards,
  });
});

// ----------------------------------------------------
// TASKS & SUBMISSIONS
// ----------------------------------------------------
app.get('/api/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const tasks = storage.getTasks(true);
  const submissions = storage.getSubmissions(userId);
  const todayStr = new Date().toISOString().split('T')[0];

  // Map each task with user-specific status
  const tasksWithStatus = tasks.map(task => {
    // Sanitized: remove correctIndex from quiz questions when sending to client
    const sanitizedQuestions = task.quizQuestions?.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    const taskSubmissions = submissions.filter(s => s.taskId === task.id);
    const todaySubmissions = taskSubmissions.filter(s => s.createdAt.startsWith(todayStr));
    const completedToday = todaySubmissions.some(s => s.status === 'approved');
    const underReview = taskSubmissions.some(s => s.status === 'under_review');

    let userStatus: string = 'available';
    if (completedToday) userStatus = 'approved';
    else if (underReview) userStatus = 'under_review';
    else if (todaySubmissions.length >= task.dailyLimit) userStatus = 'completed';

    return {
      ...task,
      quizQuestions: sanitizedQuestions,
      userStatus,
      completedToday,
      todayCompletionsCount: todaySubmissions.length,
    };
  });

  res.json({ tasks: tasksWithStatus });
});

app.get('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const task = storage.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  // Sanitize quiz questions
  const sanitized = {
    ...task,
    quizQuestions: task.quizQuestions?.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })),
  };

  res.json({ task: sanitized });
});

app.post('/api/tasks/:id/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const proofData = req.body.proofData || {};

    const result = storage.submitTask(userId, taskId, proofData);
    const updatedWallet = storage.getWallet(userId);

    res.json({
      ...result,
      wallet: updatedWallet,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Task submission failed' });
  }
});

app.post('/api/tasks/checkin', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = storage.claimDailyCheckin(userId);
    const updatedWallet = storage.getWallet(userId);
    res.json({
      ...result,
      wallet: updatedWallet,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// WALLET & TRANSACTIONS
// ----------------------------------------------------
app.get('/api/wallet', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const wallet = storage.getWallet(userId);
  const transactions = storage.getTransactions(userId);
  res.json({ wallet, transactions });
});

app.get('/api/wallet/transactions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const transactions = storage.getTransactions(req.user!.id);
  res.json({ transactions });
});

// ----------------------------------------------------
// REFERRALS
// ----------------------------------------------------
app.get('/api/referrals', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const data = storage.getReferrals(userId);
  const settings = storage.getSettings();
  res.json({
    ...data,
    bonusPerReferral: settings.referralBonus,
    requiredTasks: settings.requiredTasksForReferral,
  });
});

// ----------------------------------------------------
// WITHDRAWALS
// ----------------------------------------------------
app.get('/api/withdrawals', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = storage.getWithdrawals(req.user!.id);
  const settings = storage.getSettings();
  res.json({
    withdrawals: list,
    limits: {
      min: settings.minWithdrawal,
      max: settings.maxWithdrawal,
    },
  });
});

app.post('/api/withdrawals/request', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, method, details } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
    }
    if (!method || (method !== 'upi' && method !== 'bank_transfer')) {
      return res.status(400).json({ error: 'Payment method must be UPI or Bank Transfer.' });
    }
    if (!details) {
      return res.status(400).json({ error: 'Payment details are required.' });
    }

    const request = storage.requestWithdrawal(userId, Number(amount), method, details);
    const updatedWallet = storage.getWallet(userId);

    res.status(201).json({
      message: 'Withdrawal request submitted successfully.',
      withdrawal: request,
      wallet: updatedWallet,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Withdrawal request failed' });
  }
});

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------
app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = storage.getNotifications(req.user!.id);
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ notifications, unreadCount });
});

app.post('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  storage.markNotificationAsRead(req.params.id, req.user!.id);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  storage.markAllNotificationsAsRead(req.user!.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & CONTROLS
// ----------------------------------------------------
app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const stats = storage.getAdminStats();
  const analytics = storage.getAnalytics30Days();
  const recentSubmissions = storage.getSubmissions().slice(0, 5);
  const recentWithdrawals = storage.getWithdrawals().slice(0, 5);
  res.json({ stats, analytics, recentSubmissions, recentWithdrawals });
});

app.get('/api/admin/analytics', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const analytics = storage.getAnalytics30Days();
  res.json({ analytics });
});

app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = storage.getUsers();
  const search = (req.query.search as string || '').toLowerCase();
  const status = req.query.status as string;

  let filtered = users;
  if (search) {
    filtered = filtered.filter(u =>
      u.fullName.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.referralCode.toLowerCase().includes(search)
    );
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(u => u.status === status);
  }

  const enriched = filtered.map(u => {
    const wallet = storage.getWallet(u.id);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      status: u.status,
      referralCode: u.referralCode,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      availableBalance: wallet.availableBalance,
      totalEarned: wallet.totalEarned,
      totalWithdrawn: wallet.totalWithdrawn,
    };
  });

  res.json({ users: enriched });
});

app.post('/api/admin/users/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  if (!['active', 'suspended', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const target = storage.findUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.role === 'admin' && req.user!.id !== target.id) {
    return res.status(403).json({ error: 'Cannot modify status of another administrator.' });
  }

  const updated = storage.updateUser(req.params.id, { status });
  storage.logAdminAction(
    req.user!.id,
    req.user!.email,
    'UPDATE_USER_STATUS',
    'USER',
    req.params.id,
    `Status set to ${status}. Reason: ${note || 'None'}`
  );

  res.json({ success: true, user: updated });
});

app.get('/api/admin/tasks', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const tasks = storage.getTasks(false);
  res.json({ tasks });
});

app.post('/api/admin/tasks', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, rewardAmount, instructions, requirements, dailyLimit, verificationType, quizQuestions, surveyFields, externalUrl, estimatedMinutes } = req.body;
    if (!title || !description || !rewardAmount) {
      return res.status(400).json({ error: 'Title, description, and reward amount are required' });
    }

    const newTask = storage.createTask({
      title,
      description,
      category: category || 'quiz',
      rewardAmount: Number(rewardAmount),
      instructions: Array.isArray(instructions) ? instructions : [instructions],
      requirements,
      dailyLimit: Number(dailyLimit) || 1,
      active: true,
      verificationType: verificationType || 'manual_review',
      quizQuestions,
      surveyFields,
      externalUrl,
      estimatedMinutes: Number(estimatedMinutes) || 3,
    });

    storage.logAdminAction(
      req.user!.id,
      req.user!.email,
      'CREATE_TASK',
      'TASK',
      newTask.id,
      `Created task: ${newTask.title} (₹${newTask.rewardAmount})`
    );

    res.status(201).json({ task: newTask });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/tasks/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = storage.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });

    storage.logAdminAction(
      req.user!.id,
      req.user!.email,
      'UPDATE_TASK',
      'TASK',
      req.params.id,
      `Updated task: ${updated.title}`
    );

    res.json({ task: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/tasks/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const deleted = storage.deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Task not found' });

  storage.logAdminAction(
    req.user!.id,
    req.user!.email,
    'DELETE_TASK',
    'TASK',
    req.params.id,
    `Deleted task ID: ${req.params.id}`
  );

  res.json({ success: true });
});

app.get('/api/admin/submissions', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const submissions = storage.getSubmissions();
  res.json({ submissions });
});

app.post('/api/admin/submissions/:id/review', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, adminNotes } = req.body;
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }
    const updated = storage.reviewSubmission(req.params.id, action, req.user!.id, adminNotes);
    res.json({ submission: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/withdrawals', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const withdrawals = storage.getWithdrawals();
  res.json({ withdrawals });
});

app.post('/api/admin/withdrawals/:id/process', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, transactionRef, adminNote } = req.body;
    if (!['approve', 'pay', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve, pay, or reject' });
    }

    const updated = storage.processWithdrawal(req.params.id, action, req.user!.id, transactionRef, adminNote);
    res.json({ withdrawal: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/broadcast', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { title, message, targetUserId } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const notif = storage.addNotification({
    userId: targetUserId || 'all',
    title,
    message,
    type: 'system',
  });

  storage.logAdminAction(
    req.user!.id,
    req.user!.email,
    'BROADCAST_NOTIFICATION',
    'NOTIFICATION',
    notif.id,
    `Target: ${targetUserId || 'ALL'} - ${title}`
  );

  res.json({ success: true, notification: notif });
});

app.get('/api/admin/settings', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: storage.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = storage.updateSettings(req.body, req.user!.id);
  res.json({ settings: updated });
});

app.get('/api/admin/audit-logs', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ logs: storage.getAuditLogs() });
});

app.get('/api/admin/export-csv/:type', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;
  let csvContent = '';
  let filename = `earnpro_${type}_${Date.now()}.csv`;

  if (type === 'users') {
    const users = storage.getUsers();
    csvContent = 'ID,Full Name,Email,Phone,Role,Status,Referral Code,Created At\n';
    users.forEach(u => {
      csvContent += `"${u.id}","${u.fullName}","${u.email}","${u.phone || ''}","${u.role}","${u.status}","${u.referralCode}","${u.createdAt}"\n`;
    });
  } else if (type === 'transactions') {
    const txs = storage.getTransactions();
    csvContent = 'ID,User ID,Type,Amount,Status,Description,Reference ID,Created At\n';
    txs.forEach(t => {
      csvContent += `"${t.id}","${t.userId}","${t.type}",${t.amount},"${t.status}","${t.description}","${t.referenceId}","${t.createdAt}"\n`;
    });
  } else if (type === 'withdrawals') {
    const wds = storage.getWithdrawals();
    csvContent = 'ID,User Name,Email,Method,Amount,Status,Details,UTR Reference,Requested At,Processed At\n';
    wds.forEach(w => {
      const details = w.method === 'upi' ? w.details.upiId : `${w.details.bankName} - ${w.details.accountNumber}`;
      csvContent += `"${w.id}","${w.userName}","${w.userEmail}","${w.method}",${w.amount},"${w.status}","${details}","${w.transactionRef || ''}","${w.requestedAt}","${w.processedAt || ''}"\n`;
    });
  } else if (type === 'submissions') {
    const subs = storage.getSubmissions();
    csvContent = 'ID,User Name,Task Title,Category,Reward (INR),Status,Created At,Reviewed By\n';
    subs.forEach(s => {
      csvContent += `"${s.id}","${s.userName || s.userId}","${s.taskTitle}","${s.category}",${s.rewardAmount},"${s.status}","${s.createdAt}","${s.reviewedBy || ''}"\n`;
    });
  } else if (type === 'analytics') {
    const analytics = storage.getAnalytics30Days();
    csvContent = 'Date,Display Date,Completed Tasks,Total Submissions,Completion Rate (%),Active Earners,Check-ins,Rewards Disbursed (INR)\n';
    analytics.trends30Days.forEach((t: any) => {
      csvContent += `"${t.date}","${t.displayDate}",${t.tasksCompleted},${t.totalSubmissions},${t.completionRate},${t.activeUsers},${t.checkinCount},${t.rewardsDisbursed}\n`;
    });
  } else {
    return res.status(400).json({ error: 'Invalid export type. Supported: users, transactions, withdrawals, submissions, analytics' });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

// ----------------------------------------------------
// VITE SETUP (Development vs Production)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EarnPro server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start EarnPro server:', err);
  process.exit(1);
});
