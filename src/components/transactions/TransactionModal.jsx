import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../data/defaultCategories';
import { getTodayDateString } from '../../utils/dates';
import { Modal } from '../common/Modal';

export function TransactionModal({ isOpen, onClose, transactionToEdit = null }) {
  const { saveTransaction, currency } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description || '');
      setAmount(String(transactionToEdit.amount || ''));
      setType(transactionToEdit.type || 'expense');
      setCategory(transactionToEdit.category || '');
      setDate(transactionToEdit.date || getTodayDateString());
      setNotes(transactionToEdit.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0].name);
      setDate(getTodayDateString());
      setNotes('');
    }
    setErrors({});
  }, [transactionToEdit, isOpen]);

  // Adjust default category when type toggles if empty
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(DEFAULT_INCOME_CATEGORIES[0].name);
    } else {
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const result = saveTransaction(
      {
        description,
        amount,
        type,
        category,
        date,
        notes,
      },
      transactionToEdit ? transactionToEdit.id : null
    );

    if (result.success) {
      onClose();
    } else {
      setErrors(result.errors || {});
    }
  };

  const categories = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Segmented Switch */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-navy-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="tx-description"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <input
            id="tx-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery store, Client payment"
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-colors ${
              errors.description ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Amount ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-colors ${
                errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
              }`}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-colors ${
                errors.date ? 'border-red-500' : 'border-slate-200 dark:border-navy-700'
              }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="tx-category"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1">{errors.category}</p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label
            htmlFor="tx-notes"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Notes (Optional)
          </label>
          <textarea
            id="tx-notes"
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add payment method or reference tags..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/30"
          >
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

