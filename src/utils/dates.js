/**
 * Utility functions for local calendar date handling without UTC shifts.
 * Dates are stored and compared in 'YYYY-MM-DD' format.
 * Month keys are 'YYYY-MM'.
 */

/**
 * Returns today's date formatted as 'YYYY-MM-DD' in local time.
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current month key as 'YYYY-MM' in local time.
 */
export function getCurrentMonthKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Extract 'YYYY-MM' from a 'YYYY-MM-DD' date string safely without Date parsing UTC drift.
 */
export function getMonthKeyFromDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return '';
}

/**
 * Parse a 'YYYY-MM' string into human readable label like 'October 2026'
 */
export function formatMonthLabel(monthKey) {
  if (!monthKey || typeof monthKey !== 'string') return '';
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return monthKey;
  
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

/**
 * Format 'YYYY-MM-DD' into a friendly local display date e.g. 'Oct 24, 2026'
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const d = new Date(year, month, day);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate previous and next month keys given a 'YYYY-MM'
 */
export function shiftMonthKey(monthKey, delta) {
  if (!monthKey) monthKey = getCurrentMonthKey();
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Check if a date string falls inside the given month key 'YYYY-MM'
 */
export function isDateInMonth(dateStr, monthKey) {
  if (!dateStr || !monthKey) return false;
  return getMonthKeyFromDate(dateStr) === monthKey;
}

/**
 * Get days in month for monthKey 'YYYY-MM'
 */
export function getDaysInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

