import { describe, it, expect } from 'vitest';
import {
  calculateTotals,
  filterTransactionsByMonth,
  calculateCategoryBreakdown,
  getBudgetStatus,
} from './calculations';

describe('Financial Calculations Utilities', () => {
  it('correctly calculates income, expenses, and balance', () => {
    const transactions = [
      { type: 'income', amount: 50000, date: '2026-10-01' },
      { type: 'expense', amount: 15000, date: '2026-10-05' },
      { type: 'expense', amount: 5000, date: '2026-10-10' },
    ];

    const totals = calculateTotals(transactions);
    expect(totals.income).toBe(50000);
    expect(totals.expenses).toBe(20000);
    expect(totals.balance).toBe(30000);
    expect(totals.savingsRate).toBe(60); // (50000 - 20000) / 50000 * 100 = 60%
  });

  it('safely handles zero income without returning NaN or Infinity', () => {
    const transactions = [
      { type: 'expense', amount: 3000, date: '2026-10-05' },
    ];

    const totals = calculateTotals(transactions);
    expect(totals.income).toBe(0);
    expect(totals.expenses).toBe(3000);
    expect(totals.balance).toBe(-3000);
    expect(totals.savingsRate).toBeNull(); // Requirement: never return NaN or Infinity
  });

  it('filters transactions strictly by month', () => {
    const transactions = [
      { id: '1', date: '2026-10-01', amount: 100 },
      { id: '2', date: '2026-10-31', amount: 200 },
      { id: '3', date: '2026-11-01', amount: 300 },
      { id: '4', date: '2026-09-30', amount: 400 },
    ];

    const oct = filterTransactionsByMonth(transactions, '2026-10');
    expect(oct).toHaveLength(2);
    expect(oct.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('calculates category breakdown percentages and totals correctly', () => {
    const transactions = [
      { type: 'expense', category: 'Food & Dining', amount: 300 },
      { type: 'expense', category: 'Food & Dining', amount: 200 },
      { type: 'expense', category: 'Transportation', amount: 500 },
    ];

    const breakdown = calculateCategoryBreakdown(transactions, 'expense');
    expect(breakdown).toHaveLength(2);
    // Transportation is 500 (50%), Food is 500 (50%)
    expect(breakdown[0].amount).toBe(500);
    expect(breakdown[0].percentage).toBe(50);
  });

  it('evaluates budget status thresholds accurately', () => {
    // Normal: < 80%
    const statusNormal = getBudgetStatus(700, 1000);
    expect(statusNormal.status).toBe('normal');
    expect(statusNormal.percentage).toBe(70);
    expect(statusNormal.remaining).toBe(300);

    // Approaching: >= 80% and < 100%
    const statusWarning = getBudgetStatus(850, 1000);
    expect(statusWarning.status).toBe('warning');
    expect(statusWarning.percentage).toBe(85);
    expect(statusWarning.remaining).toBe(150);

    // Exceeded: >= 100%
    const statusExceeded = getBudgetStatus(1200, 1000);
    expect(statusExceeded.status).toBe('exceeded');
    expect(statusExceeded.percentage).toBe(120);
    expect(statusExceeded.remaining).toBe(-200);

    // Zero budget
    const statusZero = getBudgetStatus(50, 0);
    expect(statusZero.status).toBe('no_budget');
    expect(statusZero.percentage).toBe(0);
  });
});

