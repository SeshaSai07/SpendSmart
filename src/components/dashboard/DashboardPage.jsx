import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import {
  calculateTotals,
  filterTransactionsByMonth,
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
  getBudgetStatus,
} from '../../utils/calculations';
import { formatMonthLabel } from '../../utils/dates';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../data/defaultCategories';
import { CategoryIcon } from '../common/CategoryIcon';

export function DashboardPage({ onNavigateTab, onOpenNewTransaction }) {
  const { transactions, budgets, selectedMonth, currency, loadDemoData } = useFinance();

  // Selected Month Transactions
  const monthTransactions = filterTransactionsByMonth(transactions, selectedMonth);

  // Financial Summary Cards
  const { income, expenses, balance, savingsRate } = calculateTotals(monthTransactions);

  // Category Breakdown for Donut Chart
  const categoryExpenses = calculateCategoryBreakdown(monthTransactions, 'expense');

  // Multi-month comparison for Bar Chart
  const monthlyTrends = calculateMonthlyTrends(transactions, selectedMonth, 6);

  // Budgets for Selected Month
  const currentBudgets = budgets.filter((b) => b.month === selectedMonth);
  const totalBudgeted = currentBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalBudgetStatus = getBudgetStatus(expenses, totalBudgeted);

  // Top spending categories (up to 4)
  const topCategories = categoryExpenses.slice(0, 4);

  // Recent 5 transactions in selected month
  const recentTransactions = [...monthTransactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const isDataEmpty = transactions.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner / Empty Opt-in State */}
      {isDataEmpty && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Welcome to SpendSmart</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Take complete control of your financial journey.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
              SpendSmart works 100% offline and stores your data securely inside your browser. Start by adding your first transaction, or explore the dashboard with realistic sample data.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenNewTransaction}
                className="px-4 py-2 bg-white text-emerald-800 font-semibold text-xs sm:text-sm rounded-xl hover:bg-emerald-50 transition-all shadow-md"
              >
                + Add First Transaction
              </button>
              <button
                onClick={loadDemoData}
                className="px-4 py-2 bg-emerald-700/60 hover:bg-emerald-700 border border-emerald-400/30 text-white font-medium text-xs sm:text-sm rounded-xl transition-all"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(income, currency)}
            </h3>
            <span className="text-[11px] text-slate-400">
              For {formatMonthLabel(selectedMonth)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(expenses, currency)}
            </h3>
            <span className="text-[11px] text-slate-400">
              {monthTransactions.filter((t) => t.type === 'expense').length} expense item(s)
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Net Balance
            </span>
            <h3
              className={`text-2xl font-bold ${
                balance >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(balance, currency)}
            </h3>
            <span className="text-[11px] text-slate-400">Income minus expenses</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Savings Rate
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {savingsRate !== null ? `${savingsRate}%` : 'Not available'}
            </h3>
            <span className="text-[11px] text-slate-400">
              {savingsRate !== null ? (savingsRate > 20 ? 'Target achieved (≥20%)' : 'Needs attention') : 'Requires positive income'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section: Income vs Expense Comparison & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense 6-Month Comparison */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-400">6-Month financial flow comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">Income</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">Expense</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val) => formatCurrency(val, currency)}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Spending Breakdown
            </h3>
            <p className="text-xs text-slate-400">{formatMonthLabel(selectedMonth)} by Category</p>
          </div>

          {categoryExpenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="p-3 rounded-full bg-slate-50 dark:bg-navy-800">
                <PiggyBank className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xs">No expenses recorded for this month.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryExpenses.map((entry, idx) => {
                        const cat = DEFAULT_EXPENSE_CATEGORIES.find(
                          (c) => c.name.toLowerCase() === entry.category.toLowerCase()
                        );
                        const color = cat ? cat.color : '#64748b';
                        return <Cell key={`cell-${idx}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Legend List */}
              <div className="space-y-1.5 pt-2 max-h-32 overflow-y-auto">
                {categoryExpenses.slice(0, 3).map((item) => {
                  const cat = DEFAULT_EXPENSE_CATEGORIES.find(
                    (c) => c.name.toLowerCase() === item.category.toLowerCase()
                  );
                  const color = cat ? cat.color : '#64748b';
                  return (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate max-w-[120px]">{item.category}</span>
                      </div>
                      <span className="font-semibold">{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Monthly Budget Overview & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Overview */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Budget Overview
              </h3>
              <p className="text-xs text-slate-400">Tracking spending limits</p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {currentBudgets.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No budgets set for {formatMonthLabel(selectedMonth)}.
              </p>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                Set a category budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBudgets.slice(0, 3).map((bg) => {
                const spent = monthTransactions
                  .filter((t) => t.type === 'expense' && t.category === bg.category)
                  .reduce((sum, t) => sum + Number(t.amount || 0), 0);
                const status = getBudgetStatus(spent, bg.amount);

                return (
                  <div key={bg.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bg.category}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          status.status === 'exceeded'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : status.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}
                      >
                        {status.label} ({status.percentage}%)
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          status.status === 'exceeded'
                            ? 'bg-rose-500'
                            : status.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Spent: {formatCurrency(spent, currency)}</span>
                      <span>Limit: {formatCurrency(bg.amount, currency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions in Selected Month */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-400">Latest activity in {formatMonthLabel(selectedMonth)}</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No transactions found for this month.
              </p>
              <button
                onClick={onOpenNewTransaction}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                + Record a transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {tx.description}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {tx.date} • {tx.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

