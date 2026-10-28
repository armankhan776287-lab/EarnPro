export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'blocked';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt: string;
  dailyStreak: number;
  lastCheckinDate?: string; // YYYY-MM-DD
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  dailyStreak: number;
  lastCheckinDate?: string;
}

export interface Wallet {
  userId: string;
  availableBalance: number; // in INR ₹
  pendingBalance: number;   // in INR ₹
  totalEarned: number;      // in INR ₹
  totalWithdrawn: number;   // in INR ₹
  updatedAt: string;
}

export type TransactionType =
  | 'TASK_REWARD'
  | 'DAILY_CHECKIN'
  | 'REFERRAL_BONUS'
  | 'WITHDRAWAL_REQUEST'
  | 'WITHDRAWAL_REFUND'
  | 'ADMIN_ADJUSTMENT';

export type TransactionStatus = 'completed' | 'pending' | 'reversed' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive for credits, negative for debits
  status: TransactionStatus;
  description: string;
  referenceId: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export type TaskCategory =
  | 'checkin'
  | 'quiz'
  | 'survey'
  | 'app_test'
  | 'sponsored'
  | 'promo'
  | 'referral';

export type TaskStatus =
  | 'available'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number; // Only on server
  explanation?: string;
}

export interface SurveyField {
  id: string;
  question: string;
  type: 'radio' | 'text' | 'rating';
  options?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardAmount: number; // INR ₹
  instructions: string[];
  requirements?: string;
  dailyLimit: number;
  active: boolean;
  verificationType: 'instant_checkin' | 'auto_quiz' | 'auto_survey' | 'manual_review';
  quizQuestions?: QuizQuestion[];
  surveyFields?: SurveyField[];
  externalUrl?: string;
  estimatedMinutes: number;
  totalCompletions: number;
  todayCompletionsCount?: number;
  userStatus?: string;
  createdAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  taskTitle: string;
  category: TaskCategory;
  rewardAmount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  proofData: {
    quizAnswers?: number[];
    score?: number;
    totalQuestions?: number;
    surveyAnswers?: Record<string, string>;
    appReviewText?: string;
    proofUrl?: string;
    submittedNotes?: string;
  };
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  status: 'registered' | 'qualified' | 'rewarded';
  rewardAmount: number;
  qualifiedAt?: string;
  rewardedAt?: string;
  createdAt: string;
}

export type WithdrawalMethod = 'upi' | 'bank_transfer';

export type WithdrawalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'rejected';

export interface WithdrawalDetails {
  upiId?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: WithdrawalMethod;
  amount: number;
  fee: number;
  netAmount: number;
  details: WithdrawalDetails;
  status: WithdrawalStatus;
  adminNote?: string;
  transactionRef?: string; // e.g. UTR / Bank reference
  requestedAt: string;
  processedAt?: string;
}

export interface InAppNotification {
  id: string;
  userId: string; // 'all' or specific user ID
  title: string;
  message: string;
  type: 'task' | 'wallet' | 'withdrawal' | 'referral' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AppSettings {
  minWithdrawal: number;
  maxWithdrawal: number;
  referralBonus: number;
  requiredTasksForReferral: number;
  dailyCheckinRewards: number[];
  maintenanceMode: boolean;
  appNotice?: string;
}

export interface DashboardStats {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  dailyStreak: number;
  hasCheckedInToday: boolean;
  referralCount: number;
  completedTasksCount: number;
  pendingTasksCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalRewardsPaid: number;
  pendingTaskSubmissions: number;
  pendingWithdrawals: number;
  totalWithdrawalsProcessed: number;
}

export interface DailyTrendPoint {
  date: string;
  displayDate: string;
  tasksCompleted: number;
  tasksSubmitted: number;
  completionRate: number;
  activeUsers: number;
  rewardsDisbursed: number;
  checkinCount: number;
}

export interface CategoryDistribution {
  category: string;
  name: string;
  count: number;
  rewardTotal: number;
}

export interface AdminAnalyticsData {
  trends30Days: DailyTrendPoint[];
  categoryDistribution: CategoryDistribution[];
  summary: {
    avgCompletionRate: number;
    total30DayCompletions: number;
    peakActiveUsers: number;
    total30DayRewards: number;
  };
}
