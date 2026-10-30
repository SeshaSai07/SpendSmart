import React, { useState } from 'react';
import {
  AreaChart,
  Area,
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
} from '../../utils/calculations';
import { formatMonthLabel } from '../../utils/dates';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../data/defaultCategories';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon } from 'lucide-react';

export function AnalyticsPage() {
  const { transactions, selectedMonth, currency } = useFinance();
  const [trendRange, setTrendRange] = useState(6); // 6 or 12 months

  const monthTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const { income, expenses, balance, savingsRate } = calculateTotals(monthTransactions);

  // Category breakdowns
  const expenseBreakdown = calculateCategoryBreakdown(monthTransactions, 'expense');
  const incomeBreakdown = calculateCategoryBreakdown(monthTransactions, 'income');

  // Trend data
  const trendsData = calculateMonthlyTrends(transactions, selectedMonth, trendRange);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Monthly Summary Strip */}
      <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Period Analysis
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {formatMonthLabel(selectedMonth)} Financial Report
          </h3>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Income</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income, currency)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-navy-800" />
          <div>
            <span className="text-[11px] text-slate-400 block">Total Expenses</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(expenses, currency)}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-navy-800" />
          <div>
            <span className="text-[11px] text-slate-400 block">Net Balance</span>
            <span className={`text-base font-bold ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
              {formatCurrency(balance, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Cashflow & Balance Trend Area Chart */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Historical Net Balance Trend
            </h3>
            <p className="text-xs text-slate-400">
              Monthly net margin progression over time
            </p>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTrendRange(6)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                trendRange === 6
                  ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Past 6 Months
            </button>
            <button
              onClick={() => setTrendRange(12)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                trendRange === 12
                  ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Past 12 Months
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency), 'Net Balance']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Breakdowns: Expense Categories vs Income Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Category Breakdown */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Expense Distribution
              </h3>
              <p className="text-xs text-slate-400">Where your money went in {formatMonthLabel(selectedMonth)}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {expenseBreakdown.length} Categories
            </span>
          </div>

          {expenseBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
              No expenses recorded for this month.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseBreakdown.map((item) => {
                const cat = DEFAULT_EXPENSE_CATEGORIES.find(
                  (c) => c.name.toLowerCase() === item.category.toLowerCase()
                );
                const color = cat ? cat.color : '#64748b';

                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.percentage}%
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Income Sources Breakdown */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Income Sources
              </h3>
              <p className="text-xs text-slate-400">Earned streams in {formatMonthLabel(selectedMonth)}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              {incomeBreakdown.length} Sources
            </span>
          </div>

          {incomeBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-navy-800 rounded-xl">
              No income recorded for this month.
            </div>
          ) : (
            <div className="space-y-3">
              {incomeBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.percentage}%
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-navy-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

