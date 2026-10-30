import { describe, it, expect, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

describe('Storage Reliability Unit Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('safely saves and loads data from localStorage', () => {
    const sample = [{ id: '1', amount: 100 }];
    const saveRes = saveToStorage(STORAGE_KEYS.TRANSACTIONS, sample);
    expect(saveRes.success).toBe(true);

    const loadRes = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    expect(loadRes.error).toBeNull();
    expect(loadRes.data).toEqual(sample);
  });

  it('handles corrupted JSON gracefully without crashing or throwing', () => {
    window.localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, '{"invalid_json: 123');
    const fallback = [{ id: 'fallback' }];
    const loadRes = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, fallback);

    expect(loadRes.error).toBe('Data parsing failed');
    expect(loadRes.data).toEqual(fallback);
  });
});

