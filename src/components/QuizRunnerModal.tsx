import React, { useState } from 'react';
import { Task, QuizQuestion } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { fireSuccessConfetti } from '../utils/confetti.ts';
import { formatINR } from '../utils/i18n.ts';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Award, RotateCcw, X } from 'lucide-react';

interface QuizRunnerModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuizRunnerModal({ task, onClose, onSuccess }: QuizRunnerModalProps) {
  const { updateWallet, refreshUserData } = useAuth();
  const { showToast } = useToast();

  const questions: QuizQuestion[] = task.quizQuestions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    autoApproved: boolean;
    rewardCredited: number;
    score?: number;
    total?: number;
    message: string;
  } | null>(null);

  const currentQ = questions[currentIdx];
  const hasSelectedCurrent = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (result) return;
    const nextAnswers = [...selectedAnswers];
    nextAnswers[currentIdx] = optionIndex;
    setSelectedAnswers(nextAnswers);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswers.length < questions.length) {
      showToast('Please answer all questions before submitting', 'error');
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
            quizAnswers: selectedAnswers,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      setResult({
        autoApproved: data.autoApproved,
        rewardCredited: data.rewardCredited,
        score: data.submission?.proofData?.score,
        total: data.submission?.proofData?.totalQuestions,
        message: data.message,
      });

      if (data.autoApproved) {
        fireSuccessConfetti();
        showToast(`Earned ₹${data.rewardCredited}! Wallet updated.`, 'success');
        if (data.wallet) updateWallet(data.wallet);
        refreshUserData();
        onSuccess();
      } else {
        showToast('Quiz score was below 75%. Try again later!', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-800/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Educational Quiz
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
        <div className="p-6">
          {result ? (
            /* Result View */
            <div className="text-center py-4">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                  result.autoApproved
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                }`}
              >
                {result.autoApproved ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>

              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {result.autoApproved ? 'Quiz Passed!' : 'Did Not Pass'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your Score: <strong className="text-slate-800 dark:text-slate-200">{result.score}</strong> / {result.total}
              </p>

              <div
                className={`my-4 p-4 rounded-2xl text-xs text-left leading-relaxed ${
                  result.autoApproved
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {result.message}
              </div>

              <div className="flex gap-2 justify-center mt-6">
                {!result.autoApproved && (
                  <button
                    onClick={() => {
                      setResult(null);
                      setSelectedAnswers([]);
                      setCurrentIdx(0);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95"
                >
                  Close & View Wallet
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Questions View */
            <div>
              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                  <span>
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              {currentQ ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                    {currentQ.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[currentIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(oIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="leading-normal">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No questions available for this quiz.
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasSelectedCurrent}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                  >
                    Next Question
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!hasSelectedCurrent || submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {submitting ? 'Verifying Answers...' : `Submit & Claim ${formatINR(task.rewardAmount)}`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
