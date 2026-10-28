import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  Coins,
  Bell,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Wallet as WalletIcon,
  CheckCircle2,
  Menu,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import { InAppNotification } from '../types/index.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openLegalModal: (section?: string) => void;
}

export function Navbar({ currentTab, setCurrentTab, openAuthModal, openLegalModal }: NavbarProps) {
  const { user, wallet, theme, toggleTheme, language, setLanguage, logout, switchDemoRole, t } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('earnpro_token');
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('earnpro_token');
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'tasks', label: t.tasks },
    { id: 'wallet', label: t.wallet },
    { id: 'referrals', label: t.referrals },
    { id: 'withdrawals', label: t.withdrawals },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: t.admin });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                    Earn<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Pro</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    IN
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 hidden sm:block">
                  Verified Rewards & UPI
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentTab === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            {/* Wallet Balance Pill (Desktop & Mobile) */}
            {user && wallet && (
              <button
                onClick={() => setCurrentTab('wallet')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title={t.availableBalance}
              >
                <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{formatINR(wallet.availableBalance)}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {t.notifications}
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs transition-colors ${
                              !notif.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {user.role === 'admin' ? 'Administrator' : `Streak: ${user.dailyStreak}d`}
                    </p>
                  </div>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>Ref Code:</span>
                        <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                          {user.referralCode}
                        </code>
                      </div>
                    </div>

                    {/* Quick Demo Role Switcher for instant testing */}
                    <div className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Demo Account Switch:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold">
                        <button
                          onClick={() => {
                            switchDemoRole('user');
                            setShowUserDropdown(false);
                          }}
                          className={`py-1 px-2 rounded-lg flex items-center justify-center gap-1 ${
                            user.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          User
                        </button>
                        <button
                          onClick={() => {
                            switchDemoRole('admin');
                            setShowUserDropdown(false);
                            setCurrentTab('admin');
                          }}
                          className={`py-1 px-2 rounded-lg flex items-center justify-center gap-1 ${
                            user.role === 'admin'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        openLegalModal('transparency');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {t.transparencyNotice}
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
              >
                {t.login}
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-1.5 pb-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                    currentTab === item.id
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Demo Switcher on mobile */}
            {user && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Switch Demo:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      switchDemoRole('user');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      user.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setCurrentTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
