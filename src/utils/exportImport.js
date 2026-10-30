/**
 * Export and Import utilities for CSV and JSON backups.
 * Validates schemas and safeguards against corrupt imports.
 */

import { SCHEMA_VERSION } from './storage';
import { validateTransaction, validateBudget } from './validators';

/**
 * Generates and downloads a CSV of the provided transactions.
 */
export function exportTransactionsToCSV(transactions, filename = 'spendsmart-transactions.csv') {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('No transactions available to export.');
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
  const rows = transactions.map(t => {
    const sanitizeCell = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      sanitizeCell(t.id),
      sanitizeCell(t.date),
      sanitizeCell(t.type),
      sanitizeCell(t.category),
      sanitizeCell(t.description),
      sanitizeCell(t.amount),
      sanitizeCell(t.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Creates and downloads a complete JSON backup file.
 */
export function exportFullBackupJSON(transactions, budgets, settings, filename = `spendsmart-backup-${new Date().toISOString().slice(0, 10)}.json`) {
  const backup = {
    app: 'SpendSmart',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      transactions: transactions || [],
      budgets: budgets || [],
      settings: settings || {},
    },
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Validates an imported JSON backup object without applying it yet.
 * Returns { valid: boolean, error?: string, counts?: { transactions: number, budgets: number }, sanitized?: object }
 */
export function validateImportJSON(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Invalid backup file: Not a valid JSON object.' };
  }

  if (parsed.app !== 'SpendSmart') {
    return { valid: false, error: 'Invalid backup file: File does not appear to be a SpendSmart backup.' };
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    return { valid: false, error: 'Invalid backup file: Missing "data" payload.' };
  }

  const rawTxList = parsed.data.transactions;
  const rawBudgets = parsed.data.budgets;
  const rawSettings = parsed.data.settings || {};

  if (!Array.isArray(rawTxList)) {
    return { valid: false, error: 'Invalid backup format: "transactions" must be an array.' };
  }

  const validTransactions = [];
  for (let i = 0; i < rawTxList.length; i++) {
    const item = rawTxList[i];
    const validation = validateTransaction(item);
    if (!validation.isValid) {
      return {
        valid: false,
        error: `Transaction #${i + 1} (${item.description || 'unnamed'}) is invalid: ${Object.values(validation.errors).join(', ')}`,
      };
    }
    validTransactions.push({
      ...validation.sanitizedData,
      id: item.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: item.createdAt || new Date().toISOString(),
    });
  }

  const validBudgets = [];
  if (Array.isArray(rawBudgets)) {
    for (let j = 0; j < rawBudgets.length; j++) {
      const bItem = rawBudgets[j];
      const bVal = validateBudget(bItem);
      if (!bVal.isValid) {
        return {
          valid: false,
          error: `Budget #${j + 1} is invalid: ${Object.values(bVal.errors).join(', ')}`,
        };
      }
      validBudgets.push({
        ...bVal.sanitizedData,
        id: bItem.id || `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }
  }

  return {
    valid: true,
    counts: {
      transactions: validTransactions.length,
      budgets: validBudgets.length,
    },
    sanitized: {
      transactions: validTransactions,
      budgets: validBudgets,
      settings: rawSettings,
    },
  };
}

/**
 * Trigger browser file download helper
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

