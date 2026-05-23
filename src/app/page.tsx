import React from 'react';
import Link from 'next/link';
import { getExpenses, getBudgetLogs } from '@/lib/data';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Wallet,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  Database,
  Info,
  CheckCircle,
  XCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Activity,
} from 'lucide-react';
import ExpenseForm from '@/components/ExpenseForm';
import TreasurerActions from '@/components/TreasurerActions';
import BudgetAdjustmentForm from '@/components/BudgetAdjustmentForm';

// Category meta configuration
const CATEGORIES: Record<string, { label: string; bg: string; text: string; fill: string }> = {
  SUPPLIES: { label: 'Supplies', bg: 'bg-amber-100 dark:bg-amber-950/40 border border-amber-250/20', text: 'text-amber-800 dark:text-amber-400', fill: 'bg-amber-500' },
  TRANSPORTATION: { label: 'Transportation', bg: 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200/20', text: 'text-teal-800 dark:text-teal-400', fill: 'bg-teal-500' },
  EQUIPMENT: { label: 'Equipment', bg: 'bg-purple-100 dark:bg-purple-950/40 border border-purple-250/20', text: 'text-purple-800 dark:text-purple-400', fill: 'bg-purple-500' },
};

function getCategoryMeta(cat: string) {
  const norm = (cat || '').toUpperCase();
  return CATEGORIES[norm] || { label: cat, bg: 'bg-zinc-150 dark:bg-zinc-800', text: 'text-zinc-650 dark:text-zinc-350', fill: 'bg-zinc-500' };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; role?: string }>;
}) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view || 'public';
  const role = resolvedParams.role || '';

  // 1. Fetch data from Supabase
  const expenses = await getExpenses();
  const budgetLogs = await getBudgetLogs();

  // 2. Compute dynamic metrics
  const totalAllocation = 500000.00; // Fixed baseline annual allocation

  const approvedExpenses = expenses.filter((e) => e.status === 'Approved');
  const totalLiquidated = approvedExpenses.reduce((acc, e) => acc + e.amount, 0);

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const totalPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);

  const currentBalance = totalAllocation - totalLiquidated;
  const spentPercentage = Math.min(Math.round((totalLiquidated / totalAllocation) * 100), 100);

  // Group approved expenses by category
  const categorySpent = approvedExpenses.reduce((acc, e) => {
    const cat = e.category.toUpperCase();
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(categorySpent).map(([cat, amount]) => ({
    name: cat,
    amount,
    percentage: totalLiquidated > 0 ? Math.round((amount / totalLiquidated) * 100) : 0,
    meta: getCategoryMeta(cat),
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-100 transition-colors pb-16">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-35 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white dark:text-zinc-950 font-bold tracking-tight shadow-md shadow-emerald-500/10">
              V
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">VaultTreasury</span>
              <span className="ml-1.5 text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">MVP</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link
              href="?view=public"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'public'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="?view=login"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                view === 'login' || view === 'portal'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <Lock className="w-3 h-3" />
              Secure Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

        {/* Dynamic Views Switcher */}
        {view === 'public' && (
          /* ========================================================
             1. PUBLIC SUMMARY DASHBOARD
             ======================================================== */
          <div className="space-y-8">
            
            {/* Title Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  Treasury Overview
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Public ledger tracking annual baseline allocations and verified liquidations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                <Database className="w-3.5 h-3.5" />
                Supabase Connected
              </div>
            </div>

            {/* Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Metric 1: Total Allocation */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Annual Allocation</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    ${totalAllocation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Baseline structural treasury limit
                </div>
              </div>

              {/* Metric 2: Liquidated */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Liquidated Claims</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    ${totalLiquidated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{spentPercentage}% spent</span>
                  <span>from approved budget lines</span>
                </div>
              </div>

              {/* Metric 3: Balance */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Current Balance</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${100 - spentPercentage}%` }} />
                </div>
              </div>

            </section>

            {/* Category breakdown (if any approved claims exist) */}
            {approvedExpenses.length > 0 && (
              <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Spending by Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {categoryBreakdown.map((item) => (
                    <div key={item.name} className="border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                        <span>{item.meta.label}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="w-full h-1 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Audit Log Table */}
            <section className="space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Ledger Logs & Transaction Feed
              </h2>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 max-h-[450px] overflow-y-auto">
                {budgetLogs.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-6">No logs recorded yet in database.</p>
                ) : (
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
                    {budgetLogs.map((log) => {
                      const isAdjustment = log.type === 'BUDGET_ADJUSTMENT';
                      return (
                        <div key={log.id} className="relative pl-6 space-y-1">
                          <span 
                            className={`absolute left-[5px] top-1.5 w-1.5 h-1.5 rounded-full border ${
                              isAdjustment 
                                ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900' 
                                : log.amountImpact < 0 
                                ? 'bg-rose-500 border-rose-200 dark:border-rose-900' 
                                : 'bg-zinc-400 border-zinc-200 dark:border-zinc-850'
                            }`} 
                          />
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-normal">
                              {log.activity}
                            </p>
                            {log.amountImpact !== 0 && (
                              <span className={`text-xs font-bold shrink-0 ${log.amountImpact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {log.amountImpact > 0 ? '+' : ''}
                                ${Math.abs(log.amountImpact).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

          </div>
        )}

        {view === 'login' && (
          /* ========================================================
             2. SECURE ACCESS GATE
             ======================================================== */
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-8 shadow-md shadow-zinc-100/50 dark:shadow-none space-y-6 mt-12">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Select Portal Access</h2>
              <p className="text-xs text-zinc-500">Choose your operational interface to request database write access.</p>
            </div>

            <div className="space-y-3">
              <Link
                href="?view=portal&role=member"
                className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-emerald-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all group"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Student Member Desk</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Submit claim liquidations and view claim logs</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-1" />
              </Link>

              <Link
                href="?view=portal&role=treasurer"
                className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-emerald-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all group"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Treasurer Operations Desk</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Manage queues, audit balance adjustments</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-all group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-center">
              <Link href="?view=public" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {view === 'portal' && role === 'member' && (
          /* ========================================================
             3. MEMBER PORTAL: Liquidation Submission
             ======================================================== */
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Link href="?view=login" className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-550 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Member Desk</h1>
                <p className="text-[10px] text-zinc-500">Liquidation entry desk. Claims undergo manual audit.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1">
                <ExpenseForm />
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">My Claim Status Logs</h2>
                {expenses.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-12 text-center rounded-2xl shadow-sm">
                    <p className="font-semibold text-zinc-800">No requests found.</p>
                    <p className="text-xs text-zinc-500 mt-1">Submit your first claim using the form on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => {
                      const meta = getCategoryMeta(expense.category);
                      return (
                        <div key={expense.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-semibold">
                              <span className={`px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</span>
                              <span className="text-zinc-400">•</span>
                              <span className="text-zinc-450">{expense.date}</span>
                            </div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{expense.title}</h4>
                            <p className="text-[10px] text-zinc-400">Claimant: {expense.submittedBy}</p>
                          </div>
                          <div className="text-right space-y-1.5">
                            <p className="font-bold text-sm">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              expense.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20'
                                : expense.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20'
                                : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20'
                            }`}>
                              {expense.status === 'Pending' ? 'Under Review' : expense.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'portal' && role === 'treasurer' && (
          /* ========================================================
             4. OPERATIONS DESK (TREASURER VIEW)
             ======================================================== */
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <Link href="?view=login" className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-550 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Operations Desk</h1>
                <p className="text-[10px] text-zinc-500">Administrative treasury ledger. Actions append transaction rows in real-time.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Pending approvals queue */}
              <div className="lg:col-span-2">
                <TreasurerActions pendingExpenses={pendingExpenses} />
              </div>

              {/* Right Column: Record balance additions */}
              <div className="lg:col-span-1">
                <BudgetAdjustmentForm />
              </div>

            </div>

            {/* Global Table */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Global Liquidation Ledger</h3>
              {expenses.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 text-center rounded-2xl shadow-sm">
                  <p className="text-xs text-zinc-400">No records exist.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800/80 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="px-5 py-4">Claim</th>
                        <th className="px-5 py-4">Submitted By</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.title}</p>
                            <span className="text-[9px] font-bold text-zinc-400 tracking-wide uppercase">{expense.category}</span>
                          </td>
                          <td className="px-5 py-4 text-zinc-500">{expense.submittedBy}</td>
                          <td className="px-5 py-4 text-zinc-400">{expense.date}</td>
                          <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-50">
                            ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              expense.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20'
                                : expense.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20'
                                : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20'
                            }`}>
                              {expense.status === 'Pending' ? 'Under Review' : expense.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
