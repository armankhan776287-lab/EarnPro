import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { formatINR } from '../utils/i18n.ts';
import {
  ArrowDownToLine,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Send,
  Building2,
  Smartphone,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { WithdrawalRequest, WithdrawalMethod } from '../types/index.ts';
import { SaveToDriveModal } from './SaveToDriveModal.tsx';

interface WithdrawalViewProps {
  openAuthModal: () => void;
}

export function WithdrawalView({ openAuthModal }: WithdrawalViewProps) {
  const { user, wallet, updateWallet, refreshUserData, t } = useAuth();
  const { showToast } = useToast();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [limits, setLimits] = useState<{ min: number; max: number }>({ min: 50, max: 10000 });
  const [method, setMethod] = useState<WithdrawalMethod>('upi');
  const [amount, setAmount] = useState<string>('50');
  const [upiId, setUpiId] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  const generateWithdrawalsCSV = (): string => {
    let csv = 'Payout ID,Method,Amount (INR),Status,Payment Details,UTR Reference,Requested At,Processed At\n';
    withdrawals.forEach(w => {
      const details = w.method === 'upi' ? w.details.upiId : `${w.details.bankName} (${w.details.accountNumber})`;
      csv += `"${w.id}","${w.method}",${w.amount},"${w.status}","${details}","${w.transactionRef || ''}","${w.requestedAt}","${w.processedAt || ''}"\n`;
    });
    return csv;
  };

  const fetchWithdrawals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
        if (data.limits) setLimits(data.limits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleMaxAmount = () => {
    if (!wallet) return;
    const maxAllowed = Math.min(wallet.availableBalance, limits.max);
    setAmount(Math.floor(maxAllowed).toString());
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < limits.min) {
      showToast(`Minimum withdrawal is ₹${limits.min}`, 'error');
      return;
    }
    if (numAmount > limits.max) {
      showToast(`Maximum withdrawal is ₹${limits.max}`, 'error');
      return;
    }
    if (!wallet || wallet.availableBalance < numAmount) {
      showToast('Insufficient available balance.', 'error');
      return;
    }

    const details =
      method === 'upi'
        ? { upiId: upiId.trim(), accountHolder: user.fullName }
        : {
            accountHolder: accountHolder.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.trim().toUpperCase(),
            bankName: bankName.trim(),
          };

    setSubmitting(true);
    try {
      const token = localStorage.getItem('earnpro_token');
      const res = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: numAmount,
          method,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      showToast(`Withdrawal of ₹${numAmount} requested! Funds reserved safely.`, 'success');
      if (data.wallet) updateWallet(data.wallet);
      await fetchWithdrawals();
      await refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.withdrawals}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Fast direct disbursements to Google Pay, PhonePe, Paytm UPI, and direct Indian bank accounts.
        </p>
      </div>

      {/* Main Grid: Form on Left, Balance & Rules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              {t.requestWithdrawal}
            </h3>

            <form onSubmit={handleRequestWithdrawal} className="space-y-5">
              {/* Payment Method Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t.selectPaymentMethod}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      method === 'upi'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>UPI (Instant / VPA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('bank_transfer')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      method === 'bank_transfer'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Bank Transfer (IMPS)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input with Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.withdrawalAmount}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Available: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(wallet?.availableBalance ?? 0)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={limits.min}
                    max={limits.max}
                    step="1"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar">
                  {[50, 100, 200, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        Number(amount) === val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Dynamic Account Fields */}
              {method === 'upi' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.upiId}
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okhdfcbank or yourname@paytm"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Funds will be dispatched directly to your UPI-linked bank account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.accountHolder}
                    </label>
                    <input
                      type="text"
                      required
                      value={accountHolder}
                      onChange={e => setAccountHolder(e.target.value)}
                      placeholder="Name as per Bank Passbook"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.accountNumber}
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.ifscCode}
                      </label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={e => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.bankName}
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India, HDFC Bank"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Security Warning Notice */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Zero Risk & Bank Security Guarantee</p>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300 mt-0.5">
                    EarnPro will <strong>NEVER</strong> ask for your UPI PIN, banking password, or OTP. You only receive money; never enter a PIN to receive payments.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (wallet?.availableBalance ?? 0) < limits.min}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Reserving Funds & Processing...'
                    : (wallet?.availableBalance ?? 0) < limits.min
                    ? `Min balance of ₹${limits.min} required to withdraw`
                    : `${t.submitRequest} (₹${amount || '0'})`}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Limits, Rules & Transparency */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disbursement Limits & Speed
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Minimum Request:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{limits.min}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Maximum Request:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{limits.max.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Processing Fee:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0.00 (Free)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Turnaround Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">2 to 24 Hours</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Reserve Policy:</strong> When you request a payout, the amount is deducted from Available Balance and placed into Pending Balance. If rejected for invalid UPI ID, funds are safely refunded back to your wallet.
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {t.withdrawalHistory}
          </h3>
          {withdrawals.length > 0 && (
            <button
              onClick={() => setDriveModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition-all flex items-center gap-1.5"
              title={t.saveReportToDrive}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{t.saveReportToDrive}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading payout records...</div>
        ) : withdrawals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            You haven't made any withdrawal requests yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {withdrawals.map(req => {
              const isPaid = req.status === 'paid';
              const isRejected = req.status === 'rejected';

              return (
                <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : isRejected
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <ArrowDownToLine className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ₹{req.amount} via {req.method.toUpperCase()}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                              : isRejected
                              ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.method === 'upi' ? `UPI: ${req.details.upiId}` : `Bank: ${req.details.accountNumber} (${req.details.ifscCode})`}
                      </p>

                      {req.transactionRef && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                          <span>UTR / Ref:</span>
                          <span className="font-bold">{req.transactionRef}</span>
                        </div>
                      )}

                      {req.adminNote && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">
                          Note: {req.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs text-slate-400">
                      {new Date(req.requestedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{req.id}</p>
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
        fileName={`EarnPro_Payouts_${user?.id || 'account'}_${new Date().toISOString().split('T')[0]}.csv`}
        fileDescription={`Export of ${withdrawals.length} withdrawal payout records for account ${user?.email}`}
        getContent={generateWithdrawalsCSV}
      />
    </div>
  );
}
