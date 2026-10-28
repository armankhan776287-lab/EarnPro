import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, HelpCircle, Trash2, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export function LegalModal({ isOpen, onClose, initialSection = 'transparency' }: LegalModalProps) {
  const { user, t } = useAuth();
  const { showToast } = useToast();
  const [section, setSection] = useState<string>(initialSection);
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = () => {
    setDeletionConfirmed(true);
    showToast('Your account deletion request has been registered with data protection compliance.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Transparency, Legal & Support Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab links */}
        <div className="flex items-center gap-1 overflow-x-auto px-6 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold no-scrollbar shrink-0">
          {[
            { id: 'transparency', label: 'Funding & Legitimacy' },
            { id: 'earning', label: 'Earning Rules' },
            { id: 'withdrawal', label: 'Withdrawal Policy' },
            { id: 'terms', label: 'Terms & Conditions' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'support', label: 'Support & Help' },
            { id: 'delete', label: 'Data & Account Deletion' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                section === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {section === 'transparency' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                How Are EarnPro Rewards Funded?
              </h4>
              <p>
                EarnPro operates as a legitimate crowdsourced micro-task and research aggregator. Rewards are directly funded by:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Verified Market Research Sponsors:</strong> Indian consumer brands and academic researchers pay for authentic feedback on digital payment habits and smartphone apps.
                </li>
                <li>
                  <strong>App Quality Assurance Programs:</strong> Software developers pay testing fees to verify that new Android releases run smoothly on different smartphone models.
                </li>
                <li>
                  <strong>Financial Literacy Grants:</strong> Educational quiz rewards are sponsored to foster safer online banking habits and combat UPI phishing.
                </li>
              </ul>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium">
                <strong>No Deposit Required:</strong> EarnPro is 100% free. Users are NEVER asked to pay or deposit money to unlock tasks or request withdrawals.
              </div>
            </div>
          )}

          {section === 'earning' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Earning Guidelines & Anti-Cheat Standards
              </h4>
              <p>
                To maintain a fair ecosystem for advertisers and participants, the following rules apply:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Single Account Limit:</strong> Only one account per person and primary device is permitted. Operating automated bots, emulators, or multi-accounting results in immediate balance forfeiture and account block.
                </li>
                <li>
                  <strong>Legitimate Quiz Passing:</strong> Educational quizzes require a 75% or higher score for automatic instant rewards.
                </li>
                <li>
                  <strong>Authentic Reviews:</strong> For app testing and brand tasks, submit real observations. Copy-pasting text from other sources will be rejected upon review.
                </li>
              </ul>
            </div>
          )}

          {section === 'withdrawal' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                UPI & Bank Payout Policy
              </h4>
              <p>
                All payouts are processed using verified banking rails (National Payments Corporation of India UPI & IMPS):
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Minimum Withdrawal:</strong> ₹50. Maximum per single transaction: ₹10,000.
                </li>
                <li>
                  <strong>Turnaround Time:</strong> Payout requests are verified within 2 to 24 hours. Once marked as Paid, an official UTR (Unique Transaction Reference) number is provided in your history.
                </li>
                <li>
                  <strong>Safety Refund:</strong> If a payout fails due to an invalid UPI ID or incorrect IFSC code, the funds are safely returned to your available wallet balance.
                </li>
              </ul>
            </div>
          )}

          {section === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Terms of Service
              </h4>
              <p>
                By using EarnPro, you agree to comply with Indian laws, including the Information Technology Act, 2000. EarnPro is an earning facilitator, not an employment guarantee. Rewards reflect completed tasks and adhere to the strict anti-fraud rules described herein.
              </p>
            </div>
          )}

          {section === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Privacy & Data Protection
              </h4>
              <p>
                Your personal details (email, phone, UPI VPA) are encrypted using industry standard protocols. We never sell your personal information to third-party telemarketers.
              </p>
            </div>
          )}

          {section === 'support' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Need Help? Contact Our Support Team
              </h4>
              <p>
                Our customer care team assists with payment inquiries, task verification, and account questions:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900 dark:text-white">Email:</span>
                  <a href="mailto:support@earnpro.in" className="text-indigo-600 hover:underline">
                    support@earnpro.in
                  </a>
                </div>
                <p className="text-[11px] text-slate-400">Response time: Usually within 12 business hours.</p>
              </div>
            </div>
          )}

          {section === 'delete' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">
                Request Account & Data Deletion
              </h4>
              <p>
                In compliance with data privacy regulations, you have the right to request deletion of your account and associated personal data.
              </p>

              {deletionConfirmed ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
                  Deletion ticket generated. Your data will be scheduled for permanent purge after closing pending balances.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Submit Account Deletion Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function Footer({ openLegalModal }: { openLegalModal: (sec?: string) => void }) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            EarnPro India • Smart Micro-Earning Platform
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            100% Free to join. Zero deposit required. Instant UPI & Bank withdrawals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <button onClick={() => openLegalModal('transparency')} className="hover:text-indigo-600 transition-colors">
            Funding Transparency
          </button>
          <span>•</span>
          <button onClick={() => openLegalModal('terms')} className="hover:text-indigo-600 transition-colors">
            Terms & Conditions
          </button>
          <span>•</span>
          <button onClick={() => openLegalModal('privacy')} className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button onClick={() => openLegalModal('withdrawal')} className="hover:text-indigo-600 transition-colors">
            Withdrawal Policy
          </button>
          <span>•</span>
          <button onClick={() => openLegalModal('support')} className="hover:text-indigo-600 transition-colors">
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}
