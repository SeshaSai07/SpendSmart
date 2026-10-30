/**
 * Centralized financial calculation utilities.
 * All figures across dashboard, analytics, transactions, and budgets derive through these utilities.
 */

import { getMonthKeyFromDate } from './dates';

/**
 * Calculate total income and expense from a list of transactions.
 * All amounts are strictly summed as positive numbers.
 */
export function calculateTotals(transactions) {
  let income = 0;
  let expenses = 0;

  if (Array.isArray(transactions)) {
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (Number.isFinite(amt) && amt > 0) {
        if (t.type === 'income') {
          income += amt;
        } else if (t.type === 'expense') {
          expenses += amt;
        }
      }
    }
  }

  // Round intermediate to 2 decimals
  income = Math.round(income * 100) / 100;
  expenses = Math.round(expenses * 100) / 100;
  const balance = Math.round((income - expenses) * 100) / 100;

  // Savings rate = (income - expenses) / income * 100, only when income > 0
  let savingsRate = null;
  if (income > 0) {
    savingsRate = Math.round(((income - expenses) / income) * 1000) / 10; // 1 decimal place
  }

  return {
    income,
    expenses,
    balance,
    savingsRate, // null when income is 0 to avoid NaN/Infinity
  };
}

/**
 * Filter transactions for a specific month (format 'YYYY-MM')
 */
export function filterTransactionsByMonth(transactions, monthKey) {
  if (!Array.isArray(transactions) || !monthKey) return [];
  return transactions.filter(t => getMonthKeyFromDate(t.date) === monthKey);
}

/**
 * Group expense transactions by category and compute totals and percentages.
 */
export function calculateCategoryBreakdown(transactions, type = 'expense') {
  if (!Array.isArray(transactions)) return [];

  const filtered = transactions.filter(t => t.type === type);
  const totalAmount = filtered.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  const groupMap = {};
  for (const t of filtered) {
    const cat = t.category || 'Other';
    const amt = Number(t.amount) || 0;
    groupMap[cat] = (groupMap[cat] || 0) + amt;
  }

  const result = Object.entries(groupMap).map(([category, amount]) => {
    const roundedAmount = Math.round(amount * 100) / 100;
    const percentage = totalAmount > 0 ? Math.round((roundedAmount / totalAmount) * 1000) / 10 : 0;
    return {
      category,
      amount: roundedAmount,
      percentage,
    };
  });

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Get monthly history trends across the past N months up to selected month.
 */
export function calculateMonthlyTrends(transactions, currentMonthKey, monthsCount = 6) {
  if (!Array.isArray(transactions)) return [];

  const [y, m] = currentMonthKey.split('-').map(Number);
  const monthKeys = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthKeys.push(mKey);
  }

  return monthKeys.map(mKey => {
    const monthTx = filterTransactionsByMonth(transactions, mKey);
    const totals = calculateTotals(monthTx);
    const [year, month] = mKey.split('-');
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
    });

    return {
      monthKey: mKey,
      label,
      income: totals.income,
      expenses: totals.expenses,
      balance: totals.balance,
      savingsRate: totals.savingsRate,
    };
  });
}

/**
 * Determine budget status and warning levels.
 * Thresholds:
 * - 'normal': < 80%
 * - 'warning' (approaching): >= 80% and < 100%
 * - 'exceeded': >= 100%
 */
export function getBudgetStatus(actualSpent, budgetAmount) {
  const spent = Number(actualSpent) || 0;
  const budget = Number(budgetAmount) || 0;

  if (budget <= 0) {
    return {
      percentage: 0,
      remaining: 0,
      status: 'no_budget',
      label: 'No budget set',
      color: 'slate',
    };
  }

  const percentage = Math.round((spent / budget) * 1000) / 10;
  const remaining = Math.round((budget - spent) * 100) / 100;

  if (percentage >= 100) {
    return {
      percentage,
      remaining,
      status: 'exceeded',
      label: 'Budget exceeded',
      color: 'red',
    };
  }

  if (percentage >= 80) {
    return {
      percentage,
      remaining,
      status: 'warning',
      label: 'Approaching limit',
      color: 'amber',
    };
  }

  return {
    percentage,
    remaining,
    status: 'normal',
    label: 'On track',
    color: 'emerald',
  };
}

