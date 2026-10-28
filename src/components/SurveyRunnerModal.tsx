import React, { useState } from 'react';
import { Task } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { fireSuccessConfetti } from '../utils/confetti.ts';
import { formatINR } from '../utils/i18n.ts';
import { X, CheckCircle2, ClipboardList } from 'lucide-react';

interface SurveyRunnerModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export function SurveyRunnerModal({ task, onClose, onSuccess }: SurveyRunnerModalProps) {
  const { updateWallet, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const fields = task.surveyFields || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSelectRadio = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTextChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all fields
    const missing = fields.find(f => !answers[f.id] || answers[f.id].trim() === '');
    if (missing) {
      showToast('Please answer all survey questions before submitting.', 'error');
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
            surveyAnswers: answers,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      setCompleted(true);
      fireSuccessConfetti();
      showToast(`Survey submitted! ₹${task.rewardAmount} credited.`, 'success');
      if (data.wallet) updateWallet(data.wallet);
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
                Verified Survey
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

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {completed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Survey Completed!</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                Thank you for providing your authentic insights. Your reward of{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(task.rewardAmount)}</strong> has been
                instantly credited to your EarnPro wallet.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95"
              >
                Done & Return to Tasks
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Please respond truthfully based on your personal smartphone and financial usage. All answers are confidential.
                </span>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-1.5">{idx + 1}.</span>
                    {field.question}
                  </label>

                  {field.type === 'radio' && field.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {field.options.map(opt => {
                        const isSelected = answers[field.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectRadio(field.id, opt)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold ring-1 ring-indigo-500'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'text' && (
                    <textarea
                      rows={3}
                      value={answers[field.id] || ''}
                      onChange={e => handleTextChange(field.id, e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : `Submit Survey (+${formatINR(task.rewardAmount)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
