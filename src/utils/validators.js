/**
 * Validation utilities for SpendSmart transactions and budgets.
 */

/**
 * Validates transaction inputs.
 * Returns { isValid: boolean, errors: Record<string, string>, sanitizedData?: object }
 */
export function validateTransaction(data) {
  const errors = {};

  // Description
  const description = (data.description || '').trim();
  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length > 100) {
    errors.description = 'Description cannot exceed 100 characters.';
  }

  // Type
  const type = data.type;
  if (type !== 'income' && type !== 'expense') {
    errors.type = 'Type must be either "income" or "expense".';
  }

  // Category
  const category = (data.category || '').trim();
  if (!category) {
    errors.category = 'Category is required.';
  }

  // Amount
  const rawAmount = data.amount;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount);

  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(numAmount) || !Number.isFinite(numAmount)) {
    errors.amount = 'Amount must be a valid number.';
  } else if (numAmount <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  } else if (numAmount > 1000000000) {
    errors.amount = 'Amount cannot exceed ₹1,000,000,000.';
  }

  // Date (expected YYYY-MM-DD)
  const date = (data.date || '').trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date) {
    errors.date = 'Date is required.';
  } else if (!dateRegex.test(date)) {
    errors.date = 'Date must be in YYYY-MM-DD format.';
  } else {
    const [y, m, d] = date.split('-').map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      errors.date = 'Please enter a valid calendar date.';
    }
  }

  // Notes
  const notes = (data.notes || '').trim();

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedData: isValid
      ? {
          description,
          type,
          category,
          amount: Math.round(numAmount * 100) / 100, // round to 2 decimal places to avoid floating point anomalies
          date,
          notes,
        }
      : null,
  };
}

/**
 * Validates budget inputs.
 * Returns { isValid: boolean, errors: Record<string, string>, sanitizedData?: object }
 */
export function validateBudget(data) {
  const errors = {};

  // Category (or 'overall' for total monthly budget)
  const category = (data.category || '').trim();
  if (!category) {
    errors.category = 'Category is required.';
  }

  // Month (YYYY-MM)
  const month = (data.month || '').trim();
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!month || !monthRegex.test(month)) {
    errors.month = 'A valid month (YYYY-MM) is required.';
  }

  // Amount
  const rawAmount = data.amount;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount);

  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    errors.amount = 'Budget limit is required.';
  } else if (isNaN(numAmount) || !Number.isFinite(numAmount)) {
    errors.amount = 'Budget limit must be a valid number.';
  } else if (numAmount <= 0) {
    errors.amount = 'Budget limit must be greater than zero.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedData: isValid
      ? {
          category,
          month,
          amount: Math.round(numAmount * 100) / 100,
        }
      : null,
  };
}

