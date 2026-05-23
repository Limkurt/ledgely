'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { submitExpenseAction, ActionState } from '@/app/actions';
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = [
  { value: 'SUPPLIES', label: 'Supplies', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50' },
  { value: 'TRANSPORTATION', label: 'Transportation', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50' },
  { value: 'EQUIPMENT', label: 'Equipment', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50' },
];

const initialState: ActionState = {
  success: false,
  errors: {},
};

export default function ExpenseForm() {
  const [state, formAction, isPending] = useActionState(submitExpenseAction, initialState);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SUPPLIES');
  const formRef = useRef<HTMLFormElement>(null);

  // Clear form on success
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      setReceiptUrl('');
      setSelectedCategory('SUPPLIES');
    }
  }, [state.success]);

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6 shadow-md shadow-zinc-100/50 dark:shadow-none">
      <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">Submit Expense Request</h2>
      
      {state.success && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium">Expense request submitted successfully!</p>
            <p className="mt-0.5 opacity-90">The treasurer has been notified and the transaction is pending review.</p>
          </div>
        </div>
      )}

      {state.errors?.form && (
        <div className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium">Failed to submit expense</p>
            <p className="mt-0.5 opacity-90">{state.errors.form?.[0]}</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Submitted By (Email) */}
          <div className="space-y-1.5">
            <label htmlFor="submittedBy" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Submitted By (Email)
            </label>
            <input
              id="submittedBy"
              name="submittedBy"
              type="email"
              placeholder="you@domain.com"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
            />
            {state.errors?.submittedBy && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.submittedBy?.[0]}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Transaction Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
            />
            {state.errors?.date && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.date?.[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Title */}
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Item Name / Description
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. AWS Hosting, Catering for workshop..."
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
            />
            {state.errors?.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.title?.[0]}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
              />
            </div>
            {state.errors?.amount && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.amount?.[0]}</p>
            )}
          </div>
        </div>

        {/* Category Visual Grid Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-950 text-white dark:bg-zinc-100 dark:border-zinc-50 dark:text-zinc-900 scale-[1.02] shadow-sm font-medium'
                      : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/70 text-zinc-600 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-900/50 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-xs">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {/* Hidden input to pass the category value */}
          <input type="hidden" name="category" value={selectedCategory} />
          {state.errors?.category && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.category?.[0]}</p>
          )}
        </div>

        {/* Receipt URL & Live Preview */}
        <div className="space-y-1.5">
          <label htmlFor="receiptUrl" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Receipt Image URL (Optional)
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <ImageIcon className="w-4 h-4" />
              </span>
              <input
                id="receiptUrl"
                name="receiptUrl"
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://example.com/receipt.jpg"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
              />
            </div>
            {receiptUrl && /^https?:\/\/.+/.test(receiptUrl) && (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex-shrink-0 flex items-center justify-center relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptUrl}
                  alt="Receipt thumbnail preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Hide if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          {state.errors?.receiptUrl && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.receiptUrl?.[0]}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-medium py-3.5 px-4 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Request...
            </>
          ) : (
            'Submit Expense'
          )}
        </button>
      </form>
    </div>
  );
}
