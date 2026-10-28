import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { ReferralRecord } from '../types/index.ts';

export function ReferralView() {
  const { user, t } = useAuth();
  const { showToast } = useToast();

  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<{
    code: string;
    count: number;
    totalEarned: number;
    list: ReferralRecord[];
    bonusPerReferral: number;
    requiredTasks: number;
  }>({
    code: user?.referralCode || 'EARNPRO',
    count: 0,
    totalEarned: 0,
    list: [],
    bonusPerReferral: 25,
    requiredTasks: 1,
  });
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/referrals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [user]);

  const referralCode = data.code || user?.referralCode || '';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    showToast(t.codeCopied, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join EarnPro with my referral code ${referralCode} and earn instant cash rewards completing simple quizzes and surveys! Register here: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Earn cash daily with EarnPro! Use invite code: ${referralCode}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.referrals}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Invite friends, colleagues, and family to EarnPro and get rewarded when they start earning.
        </p>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 sm:p-8 text-white shadow-xl shadow-purple-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-white">
              Unlimited Referral Program
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.referralTitle}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              {t.referralSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <code className="text-base sm:text-lg font-mono font-black tracking-wider px-3 py-1">
                {referralCode}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white text-purple-950 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : t.copyCode}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <button
                onClick={handleShareTelegram}
                className="flex-1 py-2 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Telegram
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.invitedFriends}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{data.count}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.earnedFromReferrals}</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatINR(data.totalEarned)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Reward per Referral</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatINR(data.bonusPerReferral)}
            </p>
          </div>
        </div>
      </div>

      {/* How it Works & Anti-Fraud Transparency */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          {t.howItWorks}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{t.step1}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              2
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{t.step2}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">
              3
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{t.step3}</p>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Anti-Abuse Rule:</strong> Referral rewards are unlocked only when the invited person completes at least {data.requiredTasks} verified task. Duplicate device registrations or self-referrals are automatically filtered to protect honest earners.
          </span>
        </div>
      </div>

      {/* Invited Friends List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
          {t.invitedFriends} ({data.list.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading referrals...</div>
        ) : data.list.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No one has joined using your code yet. Share your link on WhatsApp or Telegram to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.list.map(ref => {
              const isRewarded = ref.status === 'rewarded';
              return (
                <div key={ref.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isRewarded
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isRewarded ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {ref.referredUserName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Joined on {new Date(ref.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        isRewarded
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isRewarded ? `Rewarded (+₹${ref.rewardAmount})` : 'Awaiting 1st Task'}
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
