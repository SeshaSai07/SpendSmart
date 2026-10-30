/**
 * Safe localStorage wrapper with schema versioning, validation, and error recovery.
 */

export const SCHEMA_VERSION = '1.0.0';
export const STORAGE_KEYS = {
  TRANSACTIONS: 'spendsmart_v1_transactions',
  BUDGETS: 'spendsmart_v1_budgets',
  SETTINGS: 'spendsmart_v1_settings',
  METADATA: 'spendsmart_v1_metadata',
};

/**
 * Check if localStorage is accessible in current environment
 */
export function isStorageAvailable() {
  try {
    const testKey = '__spendsmart_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely read and parse data from localStorage.
 * If data is missing or corrupted, returns the fallback without overwriting existing data.
 */
export function loadFromStorage(key, fallbackValue) {
  if (!isStorageAvailable()) {
    console.warn(`localStorage is unavailable. Using in-memory fallback for ${key}`);
    return { data: fallbackValue, error: 'Storage unavailable' };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return { data: fallbackValue, error: null };
    }
    const parsed = JSON.parse(raw);
    return { data: parsed, error: null };
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err);
    // Never overwrite corrupted data blindly! Report error so UI can warn user.
    return { data: fallbackValue, error: 'Data parsing failed' };
  }
}

/**
 * Safely write data to localStorage.
 * Returns { success: boolean, error?: string }
 */
export function saveToStorage(key, value) {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Browser localStorage is disabled or unavailable.' };
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return { success: true };
  } catch (err) {
    console.error(`Failed to save to localStorage key "${key}":`, err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      return { success: false, error: 'Storage quota exceeded. Please export and clean up old data.' };
    }
    return { success: false, error: err.message || 'Failed to save data to localStorage.' };
  }
}

/**
 * Clear all SpendSmart items from localStorage.
 */
export function clearAllStorage() {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    window.localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.localStorage.removeItem(STORAGE_KEYS.METADATA);
    return true;
  } catch (err) {
    console.error('Failed to clear SpendSmart storage:', err);
    return false;
  }
}

