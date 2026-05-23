import React from 'react';
import Link from 'next/link';
import { getExpenses, getBudgetLogs } from '@/lib/data';
import { isNotionConfigured } from '@/lib/notion';
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
  HelpCircle,
} from 'lucide-react';
import ExpenseForm from '@/components/ExpenseForm';
import TreasurerActions from '@/components/TreasurerActions';
import BudgetAdjustmentForm from '@/components/BudgetAdjustmentForm';

// Category meta for labels and color theme styling
const CATEGORIES: Record<string, { label: string; bg: string; text: string; fill: string }> = {
  SUPPLIES: { label: 'Supplies', bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-400', fill: 'bg-amber-500' },
  FOOD_AND_BEVERAGE: { label: 'Food & Beverage', bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-400', fill: 'bg-emerald-500' },
  TRANSPORTATION: { label: 'Transportation', bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-400', fill: 'bg-blue-500' },
  ACCOMMODATION: { label: 'Accommodation', bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-400', fill: 'bg-indigo-500' },
  EQUIPMENT: { label: 'Equipment', bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-800 dark:text-purple-400', fill: 'bg-purple-500' },
  MARKETING: { label: 'Marketing', bg: 'bg-pink-100 dark:bg-pink-950/40', text: 'text-pink-800 dark:text-pink-400', fill: 'bg-pink-500' },
  UTILITIES: { label: 'Utilities', bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-400', fill: 'bg-cyan-500' },
  MISCELLANEOUS: { label: 'Miscellaneous', bg: 'bg-zinc-100 dark:bg-zinc-800/65', text: 'text-zinc-800 dark:text-zinc-300', fill: 'bg-zinc-500' },
};

function getCategoryMeta(cat: string) {
  return CATEGORIES[cat] || { label: cat, bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-800 dark:text-zinc-300', fill: 'bg-zinc-500' };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const resolvedParams = await searchParams;
  const role = resolvedParams.role || 'member';

  // Fetch data
  const expenses = await getExpenses();
  const budgetLogs = await getBudgetLogs();

  // Compute metrics
  const adjustments = budgetLogs.filter((log) => log.type === 'BUDGET_ADJUSTMENT');
  const totalAdjustments = adjustments.reduce((acc, log) => acc + log.amountImpact, 0);
  // Default base budget of $10,000 if no entries exist
  const totalBudget = totalAdjustments === 0 ? 10000 : totalAdjustments;

  const approvedExpenses = expenses.filter((e) => e.status === 'Approved');
  const totalSpent = approvedExpenses.reduce((acc, e) => acc + e.amount, 0);

  const pendingExpenses = expenses.filter((e) => e.status === 'Pending');
  const totalPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);

  const netBalance = totalBudget - totalSpent;
  const spentPercentage = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  // Group by category
  const categorySpent = approvedExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(categorySpent)
    .map(([cat, amount]) => ({
      name: cat,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      meta: getCategoryMeta(cat),
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors pb-16">
      {/* Configuration Warning Banner */}
      {!isNotionConfigured && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Notion Integration is not configured. Running in <strong>Mock Mode</strong> with local test data. Define <code>NOTION_INTEGRATION_TOKEN</code> in <code>.env.local</code> to connect your real Notion workspace.
          </span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 font-black tracking-tighter text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Ledgely</span>
              <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">Treasury Dashboard</span>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <Link
              href="?role=member"
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                role === 'member'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-300'
              }`}
            >
              Member View
            </Link>
            <Link
              href="?role=treasurer"
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                role === 'treasurer'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-300'
              }`}
            >
              Treasurer View
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Dashboard Title Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {role === 'treasurer' ? 'Treasurer Portal' : 'Liquidation & Expense Tracker'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {role === 'treasurer' 
                ? 'Review outstanding expense claims, record balance additions, and view real-time log history.' 
                : 'Submit expense claims with receipt proof and monitor your claim status.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 px-3.5 py-2 rounded-xl self-start sm:self-auto font-medium">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-500">Database Status:</span>
            <span className={isNotionConfigured ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
              {isNotionConfigured ? 'Notion Linked' : 'Mock Mode (Local)'}
            </span>
          </div>
        </div>

        {/* 1. Metrics Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Balance */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Available Balance</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                ${totalSpent.toLocaleString()} spent
              </span>
              <span>of</span>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                ${totalBudget.toLocaleString()} budget
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full transition-all duration-500" 
                style={{ width: `${spentPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Total Budget */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Budget</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2.5 text-xs text-zinc-400">
              Allocated funding through {adjustments.length || 1} additions
            </div>
          </div>

          {/* Card 3: Total Spent */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Spent</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2.5 text-xs text-zinc-400">
              Accumulated from {approvedExpenses.length} approved items ({spentPercentage}%)
            </div>
          </div>

          {/* Card 4: Pending Approvals */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pending Claims</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2.5 text-xs text-zinc-400 flex items-center gap-1">
              <span>{pendingExpenses.length} claims waiting for validation</span>
            </div>
          </div>

        </section>

        {/* 2. Category breakdown */}
        {approvedExpenses.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Approved Spending by Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-600 dark:text-zinc-400">{item.meta.label}</span>
                    <span className="text-zinc-400">{item.percentage}%</span>
                  </div>
                  <div className="text-lg font-bold">
                    ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="w-full h-1 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden">
                    <div className={`h-full ${item.meta.fill} rounded-full`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Role-Based Dashboard layout */}
        {role === 'member' ? (
          /* ========================================================
             MEMBER DASHBOARD: Submit Claims + History
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-1">
              <ExpenseForm />
            </div>

            {/* History Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Expense Claim History</h2>
                <span className="text-xs text-zinc-400">{expenses.length} claims total</span>
              </div>

              {expenses.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
                  <DollarSign className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <p className="font-semibold">No claims found</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Submit your first expense claim using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const catMeta = getCategoryMeta(expense.category);
                    return (
                      <div
                        key={expense.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-200"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${catMeta.bg} ${catMeta.text}`}>
                              {catMeta.label}
                            </span>
                            <span className="text-xs text-zinc-300 dark:text-zinc-700">•</span>
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{expense.date}</span>
                            </div>
                          </div>

                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.title}</h3>
                          
                          {/* Rejection Note */}
                          {expense.status === 'Rejected' && expense.rejectionNote && (
                            <div className="mt-2 text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-450 p-3 rounded-lg flex items-start gap-2">
                              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                              <div>
                                <strong className="font-semibold">Rejection Note: </strong>
                                <span>{expense.rejectionNote}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>

                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                              expense.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                                : expense.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                                : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30'
                            }`}
                          >
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             TREASURER PORTAL: Review + Logs + Adjustment + Ledger
             ======================================================== */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Pending Approvals list */}
              <div className="lg:col-span-2 space-y-6">
                <TreasurerActions pendingExpenses={pendingExpenses} />
              </div>

              {/* Right Column: Adjustment Form & Mini Stats */}
              <div className="lg:col-span-1 space-y-6">
                <BudgetAdjustmentForm />
              </div>

            </div>

            {/* Bottom Section: Audit Log & Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-zinc-150 dark:border-zinc-900 pt-8">
              
              {/* Ledger (Expense claim records) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Global Expense Ledger</h3>
                
                {expenses.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 text-center rounded-2xl">
                    <p className="text-zinc-500">No expense records found.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                            <th className="px-5 py-4">Item</th>
                            <th className="px-5 py-4">Submitted By</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Amount</th>
                            <th className="px-5 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.title}</div>
                                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{getCategoryMeta(expense.category).label}</div>
                              </td>
                              <td className="px-5 py-4 font-medium text-zinc-650 dark:text-zinc-450">{expense.submittedBy}</td>
                              <td className="px-5 py-4 text-zinc-500">{expense.date}</td>
                              <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                                ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    expense.status === 'Approved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                                      : expense.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                                      : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30'
                                  }`}
                                >
                                  {expense.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Logs */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Audit & Budget Logs</h3>
                
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-5 shadow-sm space-y-4 max-h-[450px] overflow-y-auto">
                  {budgetLogs.length === 0 ? (
                    <p className="text-xs text-zinc-450 text-center py-6">No logs recorded yet.</p>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
                      {budgetLogs.map((log) => {
                        const isAdjustment = log.type === 'BUDGET_ADJUSTMENT';
                        return (
                          <div key={log.id} className="relative pl-6 space-y-1">
                            {/* Bullet indicator */}
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
                              <p className="text-xs font-semibold text-zinc-850 dark:text-zinc-200 leading-normal">
                                {log.activity}
                              </p>
                              {log.amountImpact !== 0 && (
                                <span className={`text-xs font-bold shrink-0 ${log.amountImpact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {log.amountImpact > 0 ? '+' : ''}
                                  ${log.amountImpact.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-zinc-400">
                              {new Date(log.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
