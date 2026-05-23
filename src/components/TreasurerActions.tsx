'use client';

import { useState, useTransition } from 'react';
import { reviewExpenseAction } from '@/app/actions/expense';
import { Check, X, Loader2, AlertCircle, ExternalLink, Calendar, User } from 'lucide-react';
import { Expense } from '@/lib/mockStore';

interface TreasurerActionsProps {
  pendingExpenses: Expense[];
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  SUPPLIES: { label: 'Supplies', color: 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40' },
  FOOD_AND_BEVERAGE: { label: 'Food & Beverage', color: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40' },
  TRANSPORTATION: { label: 'Transportation', color: 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/40' },
  ACCOMMODATION: { label: 'Accommodation', color: 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40' },
  EQUIPMENT: { label: 'Equipment', color: 'bg-purple-100/70 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/40' },
  MARKETING: { label: 'Marketing', color: 'bg-pink-100/70 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200/50 dark:border-pink-800/40' },
  UTILITIES: { label: 'Utilities', color: 'bg-cyan-100/70 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-800/40' },
  MISCELLANEOUS: { label: 'Miscellaneous', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/40' },
};

export default function TreasurerActions({ pendingExpenses }: TreasurerActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectionIds, setRejectionIds] = useState<Record<string, boolean>>({});
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = (expense: Expense) => {
    setProcessingId(`${expense.id}-approve`);
    setErrorMsg(null);
    startTransition(async () => {
      const res = await reviewExpenseAction(
        expense.id,
        'Approved',
        '',
        expense.amount,
        expense.title,
        expense.submittedBy
      );
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to approve expense request.');
      }
      setProcessingId(null);
    });
  };

  const handleRejectInit = (id: string) => {
    setRejectionIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleCancelReject = (id: string) => {
    setRejectionIds((prev) => ({ ...prev, [id]: false }));
    setRejectionNotes((prev) => ({ ...prev, [id]: '' }));
  };

  const handleRejectSubmit = (expense: Expense) => {
    const note = rejectionNotes[expense.id] || '';
    if (!note.trim()) {
      setErrorMsg('A rejection note must be provided to reject an expense.');
      return;
    }

    setProcessingId(`${expense.id}-reject`);
    setErrorMsg(null);
    startTransition(async () => {
      const res = await reviewExpenseAction(
        expense.id,
        'Rejected',
        note,
        expense.amount,
        expense.title,
        expense.submittedBy
      );
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to reject expense request.');
      } else {
        setRejectionIds((prev) => ({ ...prev, [expense.id]: false }));
        setRejectionNotes((prev) => ({ ...prev, [expense.id]: '' }));
      }
      setProcessingId(null);
    });
  };

  const getCatMeta = (cat: string) => {
    return CATEGORY_LABELS[cat] || { label: cat, color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Pending Approvals
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-medium px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-900/30">
            {pendingExpenses.length} awaiting
          </span>
        </h2>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 p-4 rounded-xl text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {pendingExpenses.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-12 text-center">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <p className="font-medium text-zinc-800 dark:text-zinc-200">All caught up!</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">There are no pending expense reports waiting for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingExpenses.map((expense) => {
            const isRejecting = rejectionIds[expense.id];
            const rejectNote = rejectionNotes[expense.id] || '';
            const isApprovingCurrent = processingId === `${expense.id}-approve`;
            const isRejectingCurrent = processingId === `${expense.id}-reject`;
            const isProcessingAny = isPending || processingId !== null;

            return (
              <div
                key={expense.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Expense Details */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getCatMeta(expense.category).color}`}>
                        {getCatMeta(expense.category).label}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{expense.date}</span>
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{expense.submittedBy}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{expense.title}</h3>
                    </div>

                    {expense.receiptUrl && (
                      <div>
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 rounded-lg transition-all"
                        >
                          View Receipt Image
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Quick Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 self-stretch md:self-auto border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {!isRejecting ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectInit(expense.id)}
                          disabled={isProcessingAny}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject Request"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(expense)}
                          disabled={isProcessingAny}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApprovingCurrent ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Inline Rejection Sub-Form */}
                {isRejecting && (
                  <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label htmlFor={`reject-note-${expense.id}`} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Reason for Rejection
                    </label>
                    <textarea
                      id={`reject-note-${expense.id}`}
                      rows={2}
                      placeholder="e.g. Please submit a receipt that displays the full tax breakdown."
                      value={rejectNote}
                      onChange={(e) => setRejectionNotes((prev) => ({ ...prev, [expense.id]: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCancelReject(expense.id)}
                        disabled={isProcessingAny}
                        className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRejectSubmit(expense)}
                        disabled={isProcessingAny || !rejectNote.trim()}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs py-2 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRejectingCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
