import React, { useState } from 'react';
import {
  PiggyBank,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { filterTransactionsByMonth, getBudgetStatus } from '../../utils/calculations';
import { formatMonthLabel } from '../../utils/dates';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../data/defaultCategories';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CategoryIcon } from '../common/CategoryIcon';

export function BudgetsPage() {
  const {
    budgets,
    transactions,
    selectedMonth,
    currency,
    saveBudget,
    deleteBudget,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0].name);
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  // Month expense transactions
  const monthExpenses = filterTransactionsByMonth(transactions, selectedMonth).filter(
    (t) => t.type === 'expense'
  );

  // Budgets for currently selected month
  const currentMonthBudgets = budgets.filter((b) => b.month === selectedMonth);

  // Calculate totals
  const totalBudgeted = currentMonthBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalSpent = monthExpenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const overallStatus = getBudgetStatus(totalSpent, totalBudgeted);

  // Open modal for new budget or quick edit
  const handleOpenAdd = (categoryName = null, currentAmount = null) => {
    setSelectedCategory(categoryName || DEFAULT_EXPENSE_CATEGORIES[0].name);
    setAmount(currentAmount ? String(currentAmount) : '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    setErrors({});

    const result = saveBudget({
      category: selectedCategory,
      month: selectedMonth,
      amount,
    });

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setErrors(result.errors || {});
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budgeted */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Budget ({formatMonthLabel(selectedMonth)})
          </span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalBudgeted, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {currentMonthBudgets.length} allocated categories
          </p>
        </div>

        {/* Total Actual Spent */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Actual Spent
          </span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalSpent, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            All expense transactions this month
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overall Health
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h3
              className={`text-2xl font-bold ${
                overallStatus.status === 'exceeded'
                  ? 'text-rose-600 dark:text-rose-400'
                  : overallStatus.status === 'warning'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overallStatus.percentage}%
            </h3>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                overallStatus.status === 'exceeded'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                  : overallStatus.status === 'warning'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
              }`}
            >
              {overallStatus.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {overallStatus.remaining >= 0
              ? `${formatCurrency(overallStatus.remaining, currency)} remaining`
              : `${formatCurrency(Math.abs(overallStatus.remaining), currency)} over limit`}
          </p>
        </div>
      </div>

      {/* Threshold Explanation Note */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-navy-800/50 border border-slate-200/60 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Alert thresholds:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt;80% (On Track)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 80%–99.9% (Approaching Limit)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> ≥100% (Exceeded)
          </span>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Categories Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_EXPENSE_CATEGORIES.map((cat) => {
          const budgetItem = currentMonthBudgets.find(
            (b) => b.category.toLowerCase() === cat.name.toLowerCase()
          );
          const spent = monthExpenses
            .filter((t) => t.category.toLowerCase() === cat.name.toLowerCase())
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

          const budgetAmount = budgetItem ? Number(budgetItem.amount) : 0;
          const status = getBudgetStatus(spent, budgetAmount);

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Spent: {formatCurrency(spent, currency)}
                    </span>
                  </div>
                </div>

                {budgetItem && (
                  <button
                    onClick={() => setDeleteId(budgetItem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress and status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {budgetItem ? `Limit: ${formatCurrency(budgetAmount, currency)}` : 'No budget set'}
                  </span>
                  <span
                    className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                      status.status === 'exceeded'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                        : status.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        : status.status === 'normal'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
                    }`}
                  >
                    {status.label} {budgetItem ? `(${status.percentage}%)` : ''}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      status.status === 'exceeded'
                        ? 'bg-rose-500'
                        : status.status === 'warning'
                        ? 'bg-amber-500'
                        : status.status === 'normal'
                        ? 'bg-emerald-500'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenAdd(cat.name, budgetItem ? budgetItem.amount : null)}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-navy-800 dark:hover:bg-navy-700 rounded-xl transition-colors text-center"
              >
                {budgetItem ? 'Edit Budget' : '+ Set Budget'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Set/Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Budget for ${formatMonthLabel(selectedMonth)}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Budget Limit ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white ${
                errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
              }`}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-600/30"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteBudget(deleteId);
        }}
        title="Remove Budget"
        message="Are you sure you want to remove this budget allocation for this month?"
        confirmText="Remove"
        isDestructive={true}
      />
    </div>
  );
}

