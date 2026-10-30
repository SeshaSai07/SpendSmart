import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadFromStorage,
  saveToStorage,
  clearAllStorage,
  STORAGE_KEYS,
  SCHEMA_VERSION,
} from '../utils/storage';
import { getCurrentMonthKey } from '../utils/dates';
import { validateTransaction, validateBudget } from '../utils/validators';
import { getSampleData } from '../data/sampleData';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Application State
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const txRes = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    const bgRes = loadFromStorage(STORAGE_KEYS.BUDGETS, []);
    const stRes = loadFromStorage(STORAGE_KEYS.SETTINGS, { currency: 'INR', darkMode: false });

    if (txRes.error || bgRes.error || stRes.error) {
      setStorageError(txRes.error || bgRes.error || stRes.error);
    }

    setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
    setBudgets(Array.isArray(bgRes.data) ? bgRes.data : []);
    if (stRes.data?.currency) setCurrency(stRes.data.currency);
    if (stRes.data?.darkMode) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    setIsInitialized(true);
  }, []);

  // Sync dark mode class
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      saveToStorage(STORAGE_KEYS.SETTINGS, { currency, darkMode: next });
      return next;
    });
  }, [currency]);

  // Update currency
  const updateCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency);
    saveToStorage(STORAGE_KEYS.SETTINGS, { currency: newCurrency, darkMode });
  }, [darkMode]);

  // Create or Update Transaction
  const saveTransaction = useCallback((txData, editId = null) => {
    const validation = validateTransaction(txData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const cleaned = validation.sanitizedData;

    setTransactions(prev => {
      let updated;
      if (editId) {
        updated = prev.map(t => (t.id === editId ? { ...t, ...cleaned, updatedAt: new Date().toISOString() } : t));
      } else {
        const newTx = {
          ...cleaned,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        updated = [newTx, ...prev];
      }

      const saveRes = saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      if (!saveRes.success) {
        setStorageError(saveRes.error);
      } else {
        setStorageError(null);
      }
      return updated;
    });

    return { success: true };
  }, []);

  // Delete Transaction
  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      const saveRes = saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      if (!saveRes.success) {
        setStorageError(saveRes.error);
      } else {
        setStorageError(null);
      }
      return updated;
    });
  }, []);

  // Save / Update Budget
  const saveBudget = useCallback((budgetData) => {
    const validation = validateBudget(budgetData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const cleaned = validation.sanitizedData;

    setBudgets(prev => {
      // Find existing budget for this category and month
      const existingIdx = prev.findIndex(
        b => b.category.toLowerCase() === cleaned.category.toLowerCase() && b.month === cleaned.month
      );

      let updated;
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...cleaned };
      } else {
        const newBudget = {
          ...cleaned,
          id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        };
        updated = [...prev, newBudget];
      }

      const saveRes = saveToStorage(STORAGE_KEYS.BUDGETS, updated);
      if (!saveRes.success) {
        setStorageError(saveRes.error);
      } else {
        setStorageError(null);
      }
      return updated;
    });

    return { success: true };
  }, []);

  // Delete Budget
  const deleteBudget = useCallback((id) => {
    setBudgets(prev => {
      const updated = prev.filter(b => b.id !== id);
      const saveRes = saveToStorage(STORAGE_KEYS.BUDGETS, updated);
      if (!saveRes.success) {
        setStorageError(saveRes.error);
      } else {
        setStorageError(null);
      }
      return updated;
    });
  }, []);

  // Load Sample Demo Data
  const loadDemoData = useCallback(() => {
    const sample = getSampleData();
    setTransactions(sample.transactions);
    setBudgets(sample.budgets);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, sample.transactions);
    saveToStorage(STORAGE_KEYS.BUDGETS, sample.budgets);
    setStorageError(null);
  }, []);

  // Reset / Clear all data
  const resetAllData = useCallback(() => {
    clearAllStorage();
    setTransactions([]);
    setBudgets([]);
    setStorageError(null);
  }, []);

  // Bulk restore from validated JSON
  const restoreBackupData = useCallback(({ transactions: restoredTx, budgets: restoredBg, settings: restoredSt }) => {
    setTransactions(restoredTx || []);
    setBudgets(restoredBg || []);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, restoredTx || []);
    saveToStorage(STORAGE_KEYS.BUDGETS, restoredBg || []);

    if (restoredSt?.currency) {
      setCurrency(restoredSt.currency);
    }
    saveToStorage(STORAGE_KEYS.SETTINGS, restoredSt || {});
    setStorageError(null);
  }, []);

  const value = {
    transactions,
    budgets,
    selectedMonth,
    setSelectedMonth,
    currency,
    updateCurrency,
    darkMode,
    toggleDarkMode,
    storageError,
    setStorageError,
    isInitialized,
    saveTransaction,
    deleteTransaction,
    saveBudget,
    deleteBudget,
    loadDemoData,
    resetAllData,
    restoreBackupData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

