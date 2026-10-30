import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/dates';
import { ALL_CATEGORIES, getCategoryByName } from '../../data/defaultCategories';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { exportTransactionsToCSV } from '../../utils/exportImport';

export function TransactionsPage({ onEditTransaction }) {
  const { transactions, deleteTransaction, currency, selectedMonth } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all'); // all | current | specific
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc | date-asc | amount-desc | amount-asc
  const [deleteId, setDeleteId] = useState(null);

  // Available distinct months from transactions
  const availableMonths = Array.from(
    new Set(transactions.map((t) => (t.date ? t.date.slice(0, 7) : '')))
  ).filter(Boolean).sort().reverse();

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchNote = (t.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchNote) return false;
    }

    // Type
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    // Category
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Month
    if (monthFilter === 'current') {
      if (!t.date || !t.date.startsWith(selectedMonth)) return false;
    } else if (monthFilter !== 'all') {
      if (!t.date || !t.date.startsWith(monthFilter)) return false;
    }

    return true;
  });

  // Sort
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
    if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
    if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
    return 0;
  });

  // Filtered Totals
  const filteredIncome = sortedTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const filteredExpense = sortedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const filteredNet = filteredIncome - filteredExpense;

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMonthFilter('all');
    setSortBy('date-desc');
  };

  const handleExportCSV = () => {
    if (sortedTransactions.length === 0) return;
    exportTransactionsToCSV(sortedTransactions, `spendsmart-filtered-${Date.now()}.csv`);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    monthFilter !== 'all' ||
    sortBy !== 'date-desc';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        {/* Search & Export Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 rounded-xl transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={sortedTransactions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-xl transition-colors disabled:opacity-50"
              title="Export displayed transactions to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Period
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="current">Active Month ({selectedMonth})</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="date-desc">Date (Newest first)</option>
              <option value="date-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (Highest first)</option>
              <option value="amount-asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Header */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedTransactions.length}</span> transaction(s)
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(filteredIncome, currency)}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              -{formatCurrency(filteredExpense, currency)}
            </span>
            <span className={`font-semibold ${filteredNet >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
              Net: {formatCurrency(filteredNet, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              No transactions match your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query, switching category or type filters, or reset filters to see all entries.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-800/60 border-b border-slate-200/70 dark:border-navy-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80 text-sm">
                  {sortedTransactions.map((tx) => {
                    const cat = getCategoryByName(tx.category, tx.type);
                    const isIncome = tx.type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDisplayDate(tx.date)}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {tx.description}
                          </p>
                          {tx.notes && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {tx.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isIncome ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-5 text-right font-semibold whitespace-nowrap ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                              title="Edit transaction"
                              aria-label={`Edit ${tx.description}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="Delete transaction"
                              aria-label={`Delete ${tx.description}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-navy-800">
              {sortedTransactions.map((tx) => {
                const cat = getCategoryByName(tx.category, tx.type);
                const isIncome = tx.type === 'income';

                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                            {tx.description}
                          </h4>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formatDisplayDate(tx.date)} • {tx.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </p>
                      </div>
                    </div>

                    {tx.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-navy-800/50 p-2 rounded-lg">
                        {tx.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-50 dark:border-navy-800">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteTransaction(deleteId);
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action will immediately recalculate your dashboard totals and budgets."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}

