import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { X, Lock, Mail, User, Phone, Tag, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, switchDemoRole, t } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoTokenHint, setDemoTokenHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Welcome back!', 'success');
        onClose();
      } else if (mode === 'register') {
        await register(email, password, fullName, phone, referralCode);
        showToast('Account created successfully! Welcome to EarnPro.', 'success');
        onClose();
      } else if (mode === 'forgot') {
        if (!resetToken) {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          showToast(data.message, 'info');
          if (data.demoToken) {
            setDemoTokenHint(data.demoToken);
            setResetToken(data.demoToken);
          }
        } else {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: resetToken, newPassword }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          showToast(data.message, 'success');
          setMode('login');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setSubmitting(true);
    try {
      await switchDemoRole(role);
      showToast(`Logged in as Demo ${role === 'admin' ? 'Admin' : 'User'}!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Sign In to EarnPro' : mode === 'register' ? 'Create New Account' : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login'
                ? 'Access your wallet, tasks, and withdrawals'
                : mode === 'register'
                ? 'Join thousands earning verified daily cash rewards'
                : 'Recover your login access'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
            ⚡ 1-Click Instant Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Demo User (Rahul)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 mt-4 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ADMINPRO or RAHUL77"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {mode === 'forgot' && demoTokenHint && (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Account'
                : mode === 'register'
                ? 'Create EarnPro Account'
                : !demoTokenHint
                ? 'Send Reset Token'
                : 'Save New Password'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
