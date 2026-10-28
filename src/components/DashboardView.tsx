import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { fireSuccessConfetti, fireSuperConfetti } from '../utils/confetti.ts';
import { formatINR } from '../utils/i18n.ts';
import {
  Wallet,
  Clock,
  TrendingUp,
  ArrowDownToLine,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Share2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { DashboardStats, Transaction } from '../types/index.ts';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export function DashboardView({ setCurrentTab, openAuthModal }: DashboardViewProps) {
  const { user, wallet, updateWallet, refreshUserData, t } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [appNotice, setAppNotice] = useState<string>('');
  const [schedule, setSchedule] = useState<number[]>([2, 3, 5, 7, 10, 12, 15]);
  const [claimingCheckin, setClaimingCheckin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentTransactions(data.recentTransactions || []);
        setAppNotice(data.appNotice || '');
        if (data.dailyCheckinRewards) setSchedule(data.dailyCheckinRewards);
        if (data.wallet) updateWallet(data.wallet);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleClaimCheckin = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (stats?.hasCheckedInToday) {
      showToast(t.claimedToday, 'info');
      return;
    }

    setClaimingCheckin(true);
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/tasks/checkin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim check-in');
      }

      fireSuperConfetti();
      showToast(data.message || `+₹${data.amount} claimed!`, 'success');
      if (data.wallet) updateWallet(data.wallet);
      await fetchDashboardData();
      await refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setClaimingCheckin(false);
    }
  };

  // Streak days calculation
  const currentStreak = user?.dailyStreak || 0;
  const currentDayIndex = currentStreak % schedule.length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* System Notice Banner */}
      {appNotice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200/60 dark:border-indigo-800/60 backdrop-blur-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{appNotice}</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
            Live Update
          </span>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-white">
                🇮🇳 Official India Earning Hub
              </span>
              {user && (
                <span className="text-xs font-semibold text-blue-200">
                  {user.role === 'admin' ? '• Admin Access' : `• UID: ${user.id.slice(-6)}`}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.welcomeBack}, {user ? user.fullName.split(' ')[0] : 'Earner'}!
            </h1>
            <p className="text-sm text-blue-100 max-w-md leading-relaxed">
              Complete legitimate quizzes, brand testing, and daily check-ins. Instant withdrawals to Google Pay, PhonePe, and Paytm UPI.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('tasks')}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-950 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{t.allTasks}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setCurrentTab('withdrawals')}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{t.withdrawNow}</span>
            </button>
          </div>
        </div>

        {/* Subtle background ambient patterns */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Daily Check-in Streak Widget */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {t.dailyStreak}
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                  {currentStreak} {t.dayStreak}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log in daily to unlock progressively higher cash bonuses up to ₹15!
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimCheckin}
            disabled={stats?.hasCheckedInToday || claimingCheckin}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              stats?.hasCheckedInToday
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 hover:opacity-95'
            }`}
          >
            {stats?.hasCheckedInToday ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.claimedToday}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{claimingCheckin ? 'Claiming...' : t.claimDailyCheckin}</span>
              </>
            )}
          </button>
        </div>

        {/* 7-Day Streak Timeline */}
        <div className="grid grid-cols-7 gap-2">
          {schedule.map((reward, idx) => {
            const dayNum = idx + 1;
            const isCompleted = dayNum <= (currentStreak % 7 === 0 && currentStreak > 0 ? 7 : currentStreak % 7);
            const isCurrentToday = dayNum === ((currentStreak % 7) + 1);

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : isCurrentToday && !stats?.hasCheckedInToday
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Day {dayNum}
                </span>
                <span className="text-xs sm:text-sm font-extrabold">
                  +₹{reward}
                </span>
                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Wallet Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.availableBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatINR(wallet?.availableBalance ?? 0)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setCurrentTab('withdrawals')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Withdraw <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-slate-400">Min ₹50</span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.pendingBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.pendingBalance ?? 0)}
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Reserved / Under verification
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.totalEarned}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.totalEarned ?? 0)}
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            All approved tasks & bonuses
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.totalWithdrawn}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.totalWithdrawn ?? 0)}
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Paid to bank / UPI
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setCurrentTab('tasks')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Daily Quizzes</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Instant credit +₹20</p>
        </button>

        <button
          onClick={() => setCurrentTab('tasks')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Surveys & Testing</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Earn up to ₹35/task</p>
        </button>

        <button
          onClick={() => setCurrentTab('referrals')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Share2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Refer & Earn</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Get ₹25 per referral</p>
        </button>

        <button
          onClick={() => setCurrentTab('withdrawals')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant UPI</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">0% fee payout</p>
        </button>
      </div>

      {/* Recent Transactions Ledger Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.recentTransactions}
            </h3>
            <p className="text-xs text-slate-400">
              Verified financial ledger records
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('wallet')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {t.noTransactions}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map(tx => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? <TrendingUp className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <code className="font-mono">{tx.id}</code>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-extrabold ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                    </p>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
