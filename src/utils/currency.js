export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR ₹)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD $)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR €)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP £)', locale: 'en-GB' },
];

export const DEFAULT_CURRENCY_CODE = 'INR';

/**
 * Formats a numeric value into a locale-aware currency string.
 * Always handles non-finite or invalid numbers safely.
 */
export function formatCurrency(amount, currencyCode = 'INR') {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
  if (!Number.isFinite(numericAmount)) {
    return '₹0.00';
  }

  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (err) {
    // Fallback if Intl fails
    return `${currencyInfo.symbol}${numericAmount.toFixed(2)}`;
  }
}

/**
 * Formats a number with comma separators without currency symbol
 */
export function formatNumber(amount, locale = 'en-IN') {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount);
  if (!Number.isFinite(numeric)) return '0.00';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

