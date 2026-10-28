import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  ShieldCheck,
  Users,
  CheckSquare,
  ArrowDownToLine,
  TrendingUp,
  Settings,
  Bell,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Edit3,
  BarChart3,
  Activity,
  Flame,
  Coins,
  Calendar,
  ArrowUpRight,
  HardDrive,
} from 'lucide-react';
import { SaveToDriveModal } from './SaveToDriveModal.tsx';
import {
  AdminStats,
  TaskSubmission,
  WithdrawalRequest,
  Task,
  AuditLog,
  AppSettings,
  AdminAnalyticsData,
} from '../types/index.ts';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

const CustomAnalyticsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 z-50">
        <p className="font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-mono">Last 30 Days</span>
        </p>
        {payload.map((entry: any, index: number) => {
          let formattedValue = entry.value;
          if (entry.dataKey === 'completionRate') {
            formattedValue = `${entry.value}%`;
          } else if (entry.dataKey === 'rewardsDisbursed') {
            formattedValue = formatINR(entry.value);
          } else if (entry.dataKey === 'activeUsers') {
            formattedValue = `${entry.value} active earners`;
          } else if (entry.dataKey === 'checkinCount') {
            formattedValue = `${entry.value} check-ins`;
          }

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function AdminDashboardView() {
  const { user, t } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'submissions' | 'withdrawals' | 'users' | 'tasks' | 'settings' | 'broadcast' | 'audit'
  >('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [metricView, setMetricView] = useState<'completion' | 'engagement' | 'rewards'>('completion');
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals / Action states
  const [reviewModalSub, setReviewModalSub] = useState<TaskSubmission | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [utrModalWd, setUtrModalWd] = useState<WithdrawalRequest | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('quiz');
  const [newTaskReward, setNewTaskReward] = useState('25');
  const [newTaskLimit, setNewTaskLimit] = useState('1');
  const [newTaskInstructions, setNewTaskInstructions] = useState('1. Answer questions carefully\n2. Score 75% to pass');

  // Search in users
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const getHeaders = () => {
    const token = localStorage.getItem('earnpro_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, subsRes, wdsRes, usersRes, tasksRes, settingsRes, auditRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: getHeaders() }),
        fetch('/api/admin/submissions', { headers: getHeaders() }),
        fetch('/api/admin/withdrawals', { headers: getHeaders() }),
        fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}&status=${userStatusFilter}`, { headers: getHeaders() }),
        fetch('/api/admin/tasks', { headers: getHeaders() }),
        fetch('/api/admin/settings', { headers: getHeaders() }),
        fetch('/api/admin/audit-logs', { headers: getHeaders() }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
        if (d.analytics) setAnalytics(d.analytics);
      }
      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubmissions(d.submissions || []);
      }
      if (wdsRes.ok) {
        const d = await wdsRes.json();
        setWithdrawals(d.withdrawals || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsersList(d.users || []);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasksList(d.tasks || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d.settings);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.logs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [userSearch, userStatusFilter]);

  // Actions
  const handleReviewSubmission = async (action: 'approve' | 'reject') => {
    if (!reviewModalSub) return;
    try {
      const res = await fetch(`/api/admin/submissions/${reviewModalSub.id}/review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action, adminNotes: adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Submission ${action === 'approve' ? 'Approved & Reward Credited' : 'Rejected'}!`, 'success');
      setReviewModalSub(null);
      setAdminNote('');
      fetchAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleProcessWithdrawal = async (action: 'approve' | 'pay' | 'reject') => {
    if (!utrModalWd) return;
    if (action === 'pay' && !utrInput.trim()) {
      showToast('Please enter the UTR or Bank Reference Number to mark as Paid.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/withdrawals/${utrModalWd.id}/process`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          action,
          transactionRef: utrInput.trim() || undefined,
          adminNote: adminNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Withdrawal marked as ${action.toUpperCase()}!`, 'success');
      setUtrModalWd(null);
      setUtrInput('');
      setAdminNote('');
      fetchAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Processing error', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus, note: 'Updated via Admin Center' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`User status set to ${newStatus.toUpperCase()}`, 'success');
      fetchAllAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          category: newTaskCategory,
          rewardAmount: Number(newTaskReward),
          dailyLimit: Number(newTaskLimit),
          instructions: newTaskInstructions.split('\n').filter(Boolean),
          verificationType: newTaskCategory === 'quiz' ? 'auto_quiz' : newTaskCategory === 'survey' ? 'auto_survey' : 'manual_review',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('New Task Created Successfully!', 'success');
      setCreateTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      fetchAllAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleTaskActive = async (task: Task) => {
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ active: !task.active }),
      });
      if (res.ok) {
        showToast(`Task ${!task.active ? 'Activated' : 'Deactivated'}`, 'success');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
        }),
      });
      if (res.ok) {
        showToast('Notification broadcasted to all users!', 'success');
        setBroadcastTitle('');
        setBroadcastMessage('');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('System Settings updated successfully!', 'success');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [driveExportModal, setDriveExportModal] = useState<{
    open: boolean;
    type: string;
    title: string;
    filename: string;
    description: string;
  } | null>(null);

  const fetchAdminCSV = async (type: string): Promise<string> => {
    const token = localStorage.getItem('earnpro_token');
    const res = await fetch(`/api/admin/export-csv/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to export CSV report');
    }
    return await res.text();
  };

  const handleExportCSV = (type: string) => {
    const token = localStorage.getItem('earnpro_token');
    window.open(`/api/admin/export-csv/${type}?auth=${token}`, '_blank');
  };

  const handleSaveToDrive = (type: string, title: string, description: string) => {
    const today = new Date().toISOString().split('T')[0];
    setDriveExportModal({
      open: true,
      type,
      title,
      filename: `EarnPro_${type.toUpperCase()}_Audit_${today}.csv`,
      description,
    });
  };

  const renderAnalyticsSection = () => {
    if (!analytics) {
      return (
        <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Loading 30-day analytics trends...
        </div>
      );
    }

    const { trends30Days, categoryDistribution, summary } = analytics;

    return (
      <div className="space-y-6">
        {/* 30-Day Key Analytical Insights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Avg. Completion Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {summary.avgCompletionRate}%
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Above 75% Quality Benchmark</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                30-Day Completed Tasks
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary.total30DayCompletions.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Approved quizzes, surveys & test proofs
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Peak 24h Active Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary.peakActiveUsers}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Daily active earners participating
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                30-Day Rewards Velocity
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(summary.total30DayRewards)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Total cash rewards disbursed in 30d
            </p>
          </div>
        </div>

        {/* Primary Interactive 30-Day Trends Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  30-Day Performance & User Engagement Trends
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                  Rolling 30 Days
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze daily task completions, user engagement retention, and reward distribution curves.
              </p>
            </div>

            {/* Metric Switcher Segmented Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setMetricView('completion')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  metricView === 'completion'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Completion Rates & Volume</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView('engagement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  metricView === 'engagement'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Active Users & Streaks</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView('rewards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  metricView === 'rewards'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Rewards Velocity (₹)</span>
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {metricView === 'completion' ? (
                <AreaChart data={trends30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#10b981' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tasksSubmitted"
                    name="Tasks Submitted"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorSubmitted)"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tasksCompleted"
                    name="Tasks Approved"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              ) : metricView === 'engagement' ? (
                <BarChart data={trends30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="activeUsers"
                    name="Daily Active Earners"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkinCount"
                    name="Check-in Streak Claims"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#fff' }}
                  />
                </BarChart>
              ) : (
                <AreaChart data={trends30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `₹${v}`}
                  />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rewardsDisbursed"
                    name="Daily Rewards Disbursed (₹)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRewards)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Engagement & Task Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Task Category Distribution
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of task completions by category
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {categoryDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: any, item: any) => [
                      `${value} tasks (${item.payload.name})`,
                      'Completions',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categoryDistribution.map((entry, idx) => (
                <div key={entry.category} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance Breakdown Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Category Engagement & Payout Matrix
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Real-time reward velocity across educational quizzes, verified surveys, and beta testing.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryDistribution.map((cat, idx) => {
                const totalComp = categoryDistribution.reduce((acc, c) => acc + c.count, 0);
                const sharePercent = totalComp > 0 ? Math.round((cat.count / totalComp) * 100) : 0;

                return (
                  <div key={cat.category} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {cat.count} completions ({sharePercent}% of volume)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatINR(cat.rewardTotal)}
                      </p>
                      <span className="text-[10px] text-slate-400">Total Rewards</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.adminPanel}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Backend Authorization: <strong className="text-purple-600 dark:text-purple-400">{user?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllAdminData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'analytics', label: '30-Day Trends & Analytics', icon: TrendingUp },
          { id: 'submissions', label: `Task Submissions (${submissions.filter(s => s.status === 'under_review').length})`, icon: CheckSquare },
          { id: 'withdrawals', label: `Withdrawals (${withdrawals.filter(w => w.status === 'pending').length})`, icon: ArrowDownToLine },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'tasks', label: 'Task Catalog', icon: FileText },
          { id: 'broadcast', label: 'Send Alert', icon: Bell },
          { id: 'settings', label: 'App Settings', icon: Settings },
          { id: 'audit', label: 'Audit Trail', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">{t.totalUsers}</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats?.totalUsers ?? 0}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">
                {stats?.activeUsers ?? 0} active accounts
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Total Rewards Issued</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(stats?.totalRewardsPaid ?? 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Across all quizzes & tasks</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">{t.pendingTasks}</span>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">
                {stats?.pendingTaskSubmissions ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting proof review</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">{t.pendingWithdrawalsCount}</span>
              <p className="text-2xl font-extrabold text-rose-500 mt-1">
                {stats?.pendingWithdrawals ?? 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Ready for UPI disbursement</p>
            </div>
          </div>

          {/* 30-Day Trends Data Visualization Section */}
          {renderAnalyticsSection()}

          {/* CSV & Google Drive Export Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <HardDrive className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Compliance Audit & Cloud Drive Export
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Save audit reports directly to your personal Google Drive or download CSV files locally.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Google Drive Export Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 px-2 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> Drive:
                </span>
                {[
                  { type: 'users', label: 'Users', desc: 'Registered user roster & account statuses' },
                  { type: 'transactions', label: 'Ledger', desc: 'Immutable financial transactions ledger' },
                  { type: 'withdrawals', label: 'Payouts', desc: 'Disbursement requests & bank references' },
                  { type: 'submissions', label: 'Tasks', desc: 'Task submissions and verification audit' },
                  { type: 'analytics', label: '30D Trends', desc: '30-day task completion & growth analytics' },
                ].map(r => (
                  <button
                    key={r.type}
                    onClick={() => handleSaveToDrive(r.type, r.label, r.desc)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 shadow-2xs transition-colors flex items-center gap-1"
                    title={`Save ${r.label} Report to Google Drive`}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* Local Download Buttons */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> CSV:
                </span>
                {['users', 'transactions', 'withdrawals'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleExportCSV(type)}
                    className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED 30-DAY TRENDS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                30-Day Task Completion & Engagement Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed metrics for platform growth, task approval accuracy, and participant retention.
              </p>
            </div>
          </div>
          {renderAnalyticsSection()}
        </div>
      )}

      {/* TAB 2: TASK SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Task Submissions Verification
            </h3>
            <span className="text-xs text-slate-400">
              Total {submissions.length} submissions recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No submissions recorded.</div>
            ) : (
              submissions.map(sub => {
                const isUnderReview = sub.status === 'under_review' || sub.status === 'submitted';
                return (
                  <div key={sub.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.taskTitle}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          +{formatINR(sub.rewardAmount)}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            sub.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : sub.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        User: <strong className="text-slate-800 dark:text-slate-200">{sub.userName || sub.userEmail}</strong> ({sub.userEmail})
                      </p>

                      {/* Proof Details */}
                      {sub.proofData && (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                          {sub.proofData.appReviewText && (
                            <p>
                              <strong>Review Feedback:</strong> {sub.proofData.appReviewText}
                            </p>
                          )}
                          {sub.proofData.submittedNotes && (
                            <p>
                              <strong>Device/Notes:</strong> {sub.proofData.submittedNotes}
                            </p>
                          )}
                          {sub.proofData.score !== undefined && (
                            <p>
                              <strong>Auto Quiz Score:</strong> {sub.proofData.score} / {sub.proofData.totalQuestions}
                            </p>
                          )}
                          {sub.proofData.surveyAnswers && (
                            <p>
                              <strong>Survey Answers:</strong> {JSON.stringify(sub.proofData.surveyAnswers)}
                            </p>
                          )}
                        </div>
                      )}

                      {sub.adminNotes && (
                        <p className="text-[10px] text-slate-400 italic">
                          Admin Note: {sub.adminNotes} (Reviewed by: {sub.reviewedBy})
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isUnderReview ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setReviewModalSub(sub);
                            setAdminNote('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                        >
                          Review & Decide
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Reviewed {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : ''}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAWAL REQUESTS REVIEW */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Payout Requests & Disbursements
            </h3>
            <span className="text-xs text-slate-400">
              Total {withdrawals.length} withdrawal requests
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {withdrawals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No withdrawal requests found.</div>
            ) : (
              withdrawals.map(wd => {
                const isPending = wd.status === 'pending' || wd.status === 'under_review';
                return (
                  <div key={wd.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{wd.amount}
                        </span>
                        <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          {wd.method}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            wd.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-600'
                              : wd.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {wd.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        User: <strong>{wd.userName}</strong> ({wd.userEmail})
                      </p>

                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">
                        {wd.method === 'upi'
                          ? `UPI ID: ${wd.details.upiId}`
                          : `A/C: ${wd.details.accountNumber} | IFSC: ${wd.details.ifscCode} | ${wd.details.bankName}`}
                      </p>

                      {wd.transactionRef && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                          UTR Reference: <strong>{wd.transactionRef}</strong>
                        </p>
                      )}

                      {wd.adminNote && (
                        <p className="text-[10px] text-slate-400 italic">Note: {wd.adminNote}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setUtrModalWd(wd);
                            setUtrInput('');
                            setAdminNote('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Paid (Disburse)
                        </button>
                        <button
                          onClick={() => {
                            setUtrModalWd(wd);
                            setAdminNote('Invalid account details');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                        >
                          Reject & Refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Processed {wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : ''}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              User Accounts Management
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
              />
              <select
                value={userStatusFilter}
                onChange={e => setUserStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {usersList.map(u => (
              <div key={u.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {u.fullName}
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded font-mono">
                      {u.referralCode}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {u.email} • Balance: <strong className="text-emerald-600">{formatINR(u.availableBalance)}</strong> • Earned: {formatINR(u.totalEarned)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        u.status === 'active'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TASK CATALOG MANAGEMENT */}
      {activeTab === 'tasks' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Task Catalog ({tasksList.length})
            </h3>
            <button
              onClick={() => setCreateTaskOpen(!createTaskOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Task
            </button>
          </div>

          {/* Create Task Form */}
          {createTaskOpen && (
            <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Create Earning Task
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. UPI Safety Challenge Quiz"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="quiz">Educational Quiz</option>
                    <option value="survey">Verified Survey</option>
                    <option value="app_test">App Testing</option>
                    <option value="sponsored">Sponsored Task</option>
                    <option value="promo">Promotional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="Task brief..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Reward (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTaskReward}
                    onChange={e => setNewTaskReward(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Daily Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTaskLimit}
                    onChange={e => setNewTaskLimit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateTaskOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasksList.map(task => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</span>
                    <span className="text-xs font-extrabold text-emerald-600">+{formatINR(task.rewardAmount)}</span>
                    <span className="text-[10px] text-slate-400 capitalize">• {task.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleTaskActive(task)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                      task.active
                        ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {task.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENT */}
      {activeTab === 'broadcast' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-xl">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Broadcast In-App Announcement
          </h3>
          <p className="text-xs text-slate-400">
            Push an immediate notice to all registered users in their notification bell.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                placeholder="e.g. High Payout Sponsor Task Released!"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                rows={3}
                required
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                placeholder="Write message details..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast to All Users
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: APP SETTINGS */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-xl">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Global Reward & Withdrawal Rules
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Min Withdrawal (₹)</label>
              <input
                type="number"
                min="10"
                value={settings.minWithdrawal}
                onChange={e => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Withdrawal (₹)</label>
              <input
                type="number"
                value={settings.maxWithdrawal}
                onChange={e => setSettings({ ...settings, maxWithdrawal: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Referral Bonus (₹)</label>
            <input
              type="number"
              value={settings.referralBonus}
              onChange={e => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Announcement Banner</label>
            <textarea
              rows={2}
              value={settings.appNotice || ''}
              onChange={e => setSettings({ ...settings, appNotice: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-700"
          >
            Save App Settings
          </button>
        </form>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Administrative Audit Trail
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map(log => (
              <div key={log.id} className="py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                      {log.action}
                    </span>
                    <span className="text-slate-400">• By {log.adminEmail}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION REVIEW DECISION */}
      {reviewModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Decide on Submission
            </h4>
            <p className="text-xs text-slate-500">
              Task: <strong>{reviewModalSub.taskTitle}</strong> for User <strong>{reviewModalSub.userName}</strong>.
              Reward: <strong>+{formatINR(reviewModalSub.rewardAmount)}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Notes / Feedback</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Thorough feedback provided. Approved."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalSub(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSubmission('reject')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Reject
              </button>
              <button
                onClick={() => handleReviewSubmission('approve')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Approve & Credit ₹{reviewModalSub.rewardAmount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UTR REFERENCE FOR WITHDRAWAL DISBURSEMENT */}
      {utrModalWd && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Process Payout: ₹{utrModalWd.amount}
            </h4>
            <p className="text-xs text-slate-500">
              Destination: {utrModalWd.method === 'upi' ? `UPI (${utrModalWd.details.upiId})` : `Bank A/C (${utrModalWd.details.accountNumber})`}
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                UTR / Bank IMPS Reference Number *
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={e => setUtrInput(e.target.value)}
                placeholder="e.g. UTR-20261028-984128"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Note (Optional)</label>
              <input
                type="text"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Notes for ledger audit"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUtrModalWd(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessWithdrawal('reject')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Reject & Refund
              </button>
              <button
                onClick={() => handleProcessWithdrawal('pay')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
              >
                Confirm Paid (Disbursed)
              </button>
            </div>
          </div>
        </div>
      )}

      {driveExportModal && (
        <SaveToDriveModal
          isOpen={driveExportModal.open}
          onClose={() => setDriveExportModal(null)}
          fileName={driveExportModal.filename}
          fileDescription={driveExportModal.description}
          getContent={() => fetchAdminCSV(driveExportModal.type)}
        />
      )}
    </div>
  );
}
