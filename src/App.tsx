import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { WalletView } from './components/WalletView.tsx';
import { ReferralView } from './components/ReferralView.tsx';
import { WithdrawalView } from './components/WithdrawalView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LegalModal, Footer } from './components/LegalModal.tsx';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalSection, setLegalSection] = useState<string>('transparency');

  const handleOpenLegal = (sec = 'transparency') => {
    setLegalSection(sec);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openLegalModal={handleOpenLegal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            setCurrentTab={setCurrentTab}
            openAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView openAuthModal={() => setAuthModalOpen(true)} />
        )}

        {currentTab === 'wallet' && (
          <WalletView
            setCurrentTab={setCurrentTab}
            openAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'referrals' && <ReferralView />}

        {currentTab === 'withdrawals' && (
          <WithdrawalView openAuthModal={() => setAuthModalOpen(true)} />
        )}

        {currentTab === 'admin' && <AdminDashboardView />}
      </main>

      {/* Footer */}
      <Footer openLegalModal={handleOpenLegal} />

      {/* Mobile-first bottom navigation bar */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Transparency & Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialSection={legalSection}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
