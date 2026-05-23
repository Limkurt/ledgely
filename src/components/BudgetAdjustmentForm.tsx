'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { addBudgetAdjustmentAction, ActionState } from '@/app/actions';
import { Loader2, CheckCircle, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';

const initialState: ActionState = {
  success: false,
  errors: {},
};

export default function BudgetAdjustmentForm() {
  const [state, formAction, isPending] = useActionState(addBudgetAdjustmentAction, initialState);
  const [adjustmentType, setAdjustmentType] = useState<'positive' | 'negative'>('positive');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6 shadow-md shadow-zinc-100/50 dark:shadow-none">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
        Record Budget Adjustment
      </h3>

      {state.success && (
        <div className="mb-4 flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-3.5 rounded-xl text-xs transition-all animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Budget adjustment logged successfully!</p>
            <p className="opacity-90">The ledger balance has been updated in real-time.</p>
          </div>
        </div>
      )}

      {state.errors?.form && (
        <div className="mb-4 flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 p-3.5 rounded-xl text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{state.errors.form?.[0]}</p>
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        {/* Adjustment Type Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAdjustmentType('positive')}
            className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              adjustmentType === 'positive'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-850 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100/50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Cash Infusion / Top-up
          </button>
          <button
            type="button"
            onClick={() => setAdjustmentType('negative')}
            className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              adjustmentType === 'negative'
                ? 'bg-rose-50 border-rose-350 text-rose-850 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100/50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            Budget Reduction / Outflow
          </button>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="adj-amount" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">$</span>
            <input
              id="adj-amount"
              name="adj-amount-input" // intermediate element name
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
            />
          </div>
          {/* Hidden input to pass signed amount */}
          <input
            type="hidden"
            name="amount"
            value={
              // Get the actual number or handle conversion dynamically, signed based on adjustmentType
              ''
            }
            ref={(el) => {
              if (el && formRef.current) {
                const numInput = formRef.current.querySelector('#adj-amount') as HTMLInputElement;
                if (numInput) {
                  const updateVal = () => {
                    const val = parseFloat(numInput.value) || 0;
                    el.value = (adjustmentType === 'positive' ? val : -val).toString();
                  };
                  numInput.oninput = updateVal;
                  // run once now or when type changes
                  updateVal();
                }
              }
            }}
          />
          {state.errors?.amount && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.amount?.[0]}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Description / Reason
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="e.g. Q2 Corporate Sponsorship grant injection"
            required
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent transition-all"
          />
          {state.errors?.description && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{state.errors.description?.[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Logging Adjustment...
            </>
          ) : (
            'Apply Adjustment'
          )}
        </button>
      </form>
    </div>
  );
}
