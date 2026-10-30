import { describe, it, expect } from 'vitest';
import { validateTransaction, validateBudget } from './validators';

describe('Validators Unit Tests', () => {
  it('validates and accepts proper transactions', () => {
    const valid = {
      description: 'Coffee at Starbucks',
      amount: 250.5,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-10-24',
      notes: 'Card payment',
    };

    const res = validateTransaction(valid);
    expect(res.isValid).toBe(true);
    expect(res.sanitizedData.amount).toBe(250.5);
    expect(res.sanitizedData.description).toBe('Coffee at Starbucks');
  });

  it('rejects invalid, negative, zero, and non-numeric transaction amounts', () => {
    expect(validateTransaction({ description: 'Test', amount: 0, type: 'income', category: 'Salary', date: '2026-10-01' }).isValid).toBe(false);
    expect(validateTransaction({ description: 'Test', amount: -50, type: 'income', category: 'Salary', date: '2026-10-01' }).isValid).toBe(false);
    expect(validateTransaction({ description: 'Test', amount: 'abc', type: 'income', category: 'Salary', date: '2026-10-01' }).isValid).toBe(false);
    expect(validateTransaction({ description: 'Test', amount: NaN, type: 'income', category: 'Salary', date: '2026-10-01' }).isValid).toBe(false);
  });

  it('rejects missing description or invalid date formats', () => {
    const resNoDesc = validateTransaction({ description: '  ', amount: 100, type: 'income', category: 'Salary', date: '2026-10-01' });
    expect(resNoDesc.isValid).toBe(false);
    expect(resNoDesc.errors.description).toBeDefined();

    const resBadDate = validateTransaction({ description: 'Valid', amount: 100, type: 'income', category: 'Salary', date: '10-24-2026' });
    expect(resBadDate.isValid).toBe(false);
    expect(resBadDate.errors.date).toBeDefined();
  });

  it('validates budget inputs correctly', () => {
    const validBudget = {
      category: 'Food & Dining',
      month: '2026-10',
      amount: 5000,
    };
    expect(validateBudget(validBudget).isValid).toBe(true);

    const invalidBudget = {
      category: '',
      month: '2026',
      amount: -100,
    };
    const res = validateBudget(invalidBudget);
    expect(res.isValid).toBe(false);
    expect(res.errors.category).toBeDefined();
    expect(res.errors.month).toBeDefined();
    expect(res.errors.amount).toBeDefined();
  });
});

