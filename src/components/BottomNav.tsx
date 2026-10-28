import React from 'react';
import { LayoutDashboard, CheckSquare, Wallet, Users, ArrowDownToLine, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  const { user, t } = useAuth();

  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'tasks', label: t.tasks, icon: CheckSquare },
    { id: 'wallet', label: t.wallet, icon: Wallet },
    { id: 'referrals', label: t.referrals, icon: Users },
    { id: 'withdrawals', label: t.withdrawals, icon: ArrowDownToLine },
  ];

  if (user?.role === 'admin') {
    tabs[4] = { id: 'admin', label: t.admin, icon: ShieldCheck };
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60 scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium tracking-tight truncate max-w-[56px] ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
