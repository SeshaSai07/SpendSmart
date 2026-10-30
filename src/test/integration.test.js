import { describe, it, expect } from 'vitest';
import { validateImportJSON } from '../utils/exportImport';
import {
  getMonthKeyFromDate,
  formatMonthLabel,
  shiftMonthKey,
  isDateInMonth,
  getDaysInMonth,
} from '../utils/dates';

describe('Date Utilities & Leap Year Handling', () => {
  it('correctly handles leap year February days', () => {
    // 2024 was a leap year (29 days)
    expect(getDaysInMonth('2024-02')).toBe(29);
    // 2025 is not a leap year (28 days)
    expect(getDaysInMonth('2025-02')).toBe(28);
    // 2028 is a leap year (29 days)
    expect(getDaysInMonth('2028-02')).toBe(29);
  });

  it('correctly extracts month keys and prevents UTC date shift bugs', () => {
    expect(getMonthKeyFromDate('2026-10-31')).toBe('2026-10');
    expect(getMonthKeyFromDate('2026-01-01')).toBe('2026-01');
    expect(getMonthKeyFromDate('2026-12-31')).toBe('2026-12');
  });

  it('shifts months across year boundaries smoothly', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
  });

  it('tests month boundaries inclusively', () => {
    expect(isDateInMonth('2026-10-01', '2026-10')).toBe(true);
    expect(isDateInMonth('2026-10-31', '2026-10')).toBe(true);
    expect(isDateInMonth('2026-11-01', '2026-10')).toBe(false);
  });
});

describe('Backup Import Validation & Security Checks', () => {
  it('rejects malformed objects and mismatched app keys', () => {
    expect(validateImportJSON(null).valid).toBe(false);
    expect(validateImportJSON('not an object').valid).toBe(false);
    expect(validateImportJSON({ app: 'DifferentApp', data: {} }).valid).toBe(false);
  });

  it('rejects backup with invalid transaction amounts or missing fields', () => {
    const invalidBackup = {
      app: 'SpendSmart',
      version: '1.0.0',
      data: {
        transactions: [
          {
            description: 'Bad Tx',
            amount: -50,
            type: 'expense',
            category: 'Housing',
            date: '2026-10-01',
          },
        ],
        budgets: [],
      },
    };

    const res = validateImportJSON(invalidBackup);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('is invalid');
  });

  it('validates and accepts compliant backup files', () => {
    const validBackup = {
      app: 'SpendSmart',
      version: '1.0.0',
      data: {
        transactions: [
          {
            id: 'tx_1',
            description: 'Salary',
            amount: 50000,
            type: 'income',
            category: 'Salary',
            date: '2026-10-01',
          },
        ],
        budgets: [
          {
            id: 'bg_1',
            category: 'Food & Dining',
            amount: 10000,
            month: '2026-10',
          },
        ],
      },
    };

    const res = validateImportJSON(validBackup);
    expect(res.valid).toBe(true);
    expect(res.counts.transactions).toBe(1);
    expect(res.counts.budgets).toBe(1);
  });
});

