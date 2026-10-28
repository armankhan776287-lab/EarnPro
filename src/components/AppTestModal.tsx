import React, { useState } from 'react';
import { Task } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import { X, ExternalLink, ShieldAlert, CheckCircle2, Send } from 'lucide-react';

interface AppTestModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppTestModal({ task, onClose, onSuccess }: AppTestModalProps) {
  const { refreshUserData } = useAuth();
  const { showToast } = useToast();

  const [feedback, setFeedback] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      showToast('Please enter your observations or review feedback.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch(`/api/tasks/${task.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proofData: {
            appReviewText: feedback.trim(),
            submittedNotes: `Device: ${deviceModel || 'Unspecified'} | ${proofUrl ? `Proof: ${proofUrl}` : ''}`,
            proofUrl: proofUrl.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit task proof');
      }

      setSubmitted(true);
      showToast('Task proof submitted! Admin review in progress.', 'success');
      refreshUserData();
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-800/20 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {task.category === 'app_test' ? 'App Testing' : 'Sponsored Task'}
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                +{formatINR(task.rewardAmount)}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-0.5 line-clamp-1">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Proof Submitted!</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Your submission is currently <strong className="text-indigo-600 dark:text-indigo-400">Under Review</strong>.
                Administrators will verify your review and credit{' '}
                <strong className="text-slate-900 dark:text-white">{formatINR(task.rewardAmount)}</strong> directly to your wallet.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Instructions Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                  Instructions:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                  {task.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Task Link */}
              {task.externalUrl && (
                <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Step 1: Open Testing Portal / App Link
                    </span>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                      {task.externalUrl}
                    </p>
                  </div>
                  <a
                    href={task.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-indigo-700 shrink-0"
                  >
                    Open Link
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Device Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Device Model & Android Version:
                </label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={e => setDeviceModel(e.target.value)}
                  placeholder="e.g. OnePlus Nord (Android 14) or Samsung Galaxy M34"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Review / Observations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Step 2: Submit Your Feedback / Observations:
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Describe your testing experience, user interface speed, bugs noticed, or answers to the questions above..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Screenshot or Proof Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proof / Screenshot Link (Optional):
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or image link"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Anti-fraud note */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  All submissions are inspected by reviewers. Fake, copied, or AI-generated reviews without testing will be rejected and may result in account penalties.
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : `Submit Proof (+${formatINR(task.rewardAmount)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
