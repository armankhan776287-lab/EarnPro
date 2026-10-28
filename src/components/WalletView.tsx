import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  Wallet as WalletIcon,
  Clock,
  TrendingUp,
  ArrowDownToLine,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Search,
  HardDrive,
  Download,
} from 'lucide-react';
import { Transaction } from '../types/index.ts';
import { SaveToDriveModal } from './SaveToDriveModal.tsx';

interface WalletViewProps {
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export function WalletView({ setCurrentTab, openAuthModal }: WalletViewProps) {
  const { user, wallet, refreshUserData, t } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  const generateLedgerCSV = (): string => {
    let csv = 'Transaction ID,Type,Amount (INR),Status,Description,Reference ID,Date\n';
    transactions.forEach(tx => {
      csv += `"${tx.id}","${tx.type}",${tx.amount},"${tx.status}","${tx.description.replace(/"/g, '""')}","${tx.referenceId || ''}","${tx.createdAt}"\n`;
    });
    return csv;
  };

  const handleDownloadLocalCSV = () => {
    const csv = generateLedgerCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EarnPro_Statement_${user?.id || 'user'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'rewards' && (tx.type === 'TASK_REWARD' || tx.type === 'DAILY_CHECKIN')) ||
      (filterType === 'referrals' && tx.type === 'REFERRAL_BONUS') ||
      (filterType === 'withdrawals' && (tx.type === 'WITHDRAWAL_REQUEST' || tx.type === 'WITHDRAWAL_REFUND'));

    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.wallet}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically audited server-side financial ledger with zero negative balance tolerance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDriveModalOpen(true)}
            disabled={transactions.length === 0}
            className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            title={t.saveStatementToDrive}
          >
            <HardDrive className="w-4 h-4" />
            <span>{t.saveStatementToDrive}</span>
          </button>
          <button
            onClick={handleDownloadLocalCSV}
            disabled={transactions.length === 0}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              fetchTransactions();
              refreshUserData();
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentTab('withdrawals')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{t.withdrawNow}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.availableBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatINR(wallet?.availableBalance ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Ready for instant UPI payout</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.pendingBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.pendingBalance ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Reserved in payout queue</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.totalEarned}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.totalEarned ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Lifetime validated credits</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.totalWithdrawn}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatINR(wallet?.totalWithdrawn ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Successfully disbursed funds</p>
        </div>
      </div>

      {/* Ledger & Filter Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'rewards', label: 'Tasks & Check-in' },
              { id: 'referrals', label: 'Referral Bonuses' },
              { id: 'withdrawals', label: 'Withdrawals & Refunds' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  filterType === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search reference/notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Transactions Table / List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading ledger...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No transaction records found matching your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map(tx => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? <TrendingUp className="w-5 h-5" /> : <ArrowDownToLine className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.description}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          • {tx.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>TxID:</span>
                        <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-300">
                          {tx.id}
                        </code>
                        {tx.referenceId && (
                          <>
                            <span>•</span>
                            <span>Ref:</span>
                            <code className="font-mono text-[10px] text-indigo-500">{tx.referenceId}</code>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? `+${formatINR(tx.amount)}` : formatINR(tx.amount)}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SaveToDriveModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        fileName={`EarnPro_Statement_${user?.id || 'account'}_${new Date().toISOString().split('T')[0]}.csv`}
        fileDescription={`Export of ${transactions.length} wallet ledger entries for account ${user?.email}`}
        getContent={generateLedgerCSV}
      />
    </div>
  );
}
