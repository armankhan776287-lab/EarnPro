import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  BookOpen,
  ClipboardList,
  Smartphone,
  Sparkles,
  Megaphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  Filter,
  Gauge,
  Lock,
  Flame,
} from 'lucide-react';
import { QuizRunnerModal } from './QuizRunnerModal.tsx';
import { SurveyRunnerModal } from './SurveyRunnerModal.tsx';
import { AppTestModal } from './AppTestModal.tsx';

interface TasksViewProps {
  openAuthModal: () => void;
}

export function TasksView({ openAuthModal }: TasksViewProps) {
  const { user, t } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const categories = [
    { id: 'all', label: t.allTasks, icon: Sparkles },
    { id: 'quiz', label: t.quizzes, icon: BookOpen },
    { id: 'survey', label: t.surveys, icon: ClipboardList },
    { id: 'app_test', label: t.appTesting, icon: Smartphone },
    { id: 'sponsored', label: t.sponsored, icon: ShieldCheck },
    { id: 'promo', label: t.promos, icon: Megaphone },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate overall daily tasks completed vs quota across all available tasks
  const totalDailyQuota = tasks.reduce((sum, t) => sum + (t.dailyLimit || 1), 0);
  const totalCompletedToday = tasks.reduce((sum, t) => {
    const completions = Math.min(t.todayCompletionsCount || 0, t.dailyLimit || 1);
    return sum + completions;
  }, 0);
  const overallProgressPercent = totalDailyQuota > 0 ? Math.round((totalCompletedToday / totalDailyQuota) * 100) : 0;
  const remainingTotalQuota = Math.max(0, totalDailyQuota - totalCompletedToday);

  const handleStartTask = (task: Task) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setActiveTask(task);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.tasks}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete legitimate tasks to earn instant and verified wallet rewards.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Global Daily Task Quota & Capacity Banner */}
      {user && tasks.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {t.dailyProgressTitle}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {remainingTotalQuota > 0
                    ? `${remainingTotalQuota} task attempt(s) remaining for your account today`
                    : 'All daily earning quotas completed for today! Awesome job.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {totalCompletedToday} / {totalDailyQuota}
                </span>
                <span className="text-[11px] text-slate-400 ml-1">({overallProgressPercent}%)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Resets: 00:00 IST
              </span>
            </div>
          </div>

          {/* Overall Progress Bar Track */}
          <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-indigo-100/80 dark:border-indigo-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${Math.max(overallProgressPercent, 3)}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Tabs (Segmented Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks found</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting another category or check back later for new sponsor drops.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const userStatus = (task as any).userStatus || 'available';
            const isApproved = userStatus === 'approved';
            const isUnderReview = userStatus === 'under_review';

            // Daily constraint calculations
            const dailyLimit = task.dailyLimit || 1;
            const completedCount = Math.min(task.todayCompletionsCount || 0, dailyLimit);
            const progressPercent = Math.round((completedCount / dailyLimit) * 100);
            const isLimitReached = completedCount >= dailyLimit || isApproved;
            const remainingForTask = Math.max(0, dailyLimit - completedCount);

            return (
              <div
                key={task.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Reward Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {task.category.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes} {t.mins}
                      </span>
                      <span>•</span>
                      <span>Limit: {task.dailyLimit}/day</span>
                    </div>

                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{formatINR(task.rewardAmount)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>

                  {/* Requirements / Notice */}
                  {task.requirements && (
                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Requirement:</strong> {task.requirements}
                    </div>
                  )}

                  {/* Visual Progress Bar for Daily Task Limit */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t.dailyTaskLimit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {completedCount} / {dailyLimit}
                        </span>
                        <span className="text-[10px] text-slate-400">({t.tasksCompletedToday})</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isLimitReached
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : completedCount > 0
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isLimitReached
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs'
                            : completedCount > 0
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xs'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Visual Feedback Message for Daily Constraints */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      {isLimitReached ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {t.dailyLimitReached} • {t.resetsTomorrow}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{remainingForTask} {t.remainingQuota}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">Resets: 00:00 IST</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {task.totalCompletions} users rewarded
                  </span>

                  {isApproved || isLimitReached ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-default"
                      title={t.dailyLimitReached}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {t.completed}
                    </button>
                  ) : isUnderReview ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 cursor-default"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {t.underReview}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTask(task)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <span>{task.category === 'quiz' ? 'Take Quiz' : task.category === 'survey' ? 'Take Survey' : t.startTask}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Runner Modals */}
      {activeTask && activeTask.verificationType === 'auto_quiz' && (
        <QuizRunnerModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSuccess={() => {
            fetchTasks();
          }}
        />
      )}

      {activeTask && activeTask.verificationType === 'auto_survey' && (
        <SurveyRunnerModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSuccess={() => {
            fetchTasks();
          }}
        />
      )}

      {activeTask && activeTask.verificationType === 'manual_review' && (
        <AppTestModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSuccess={() => {
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
