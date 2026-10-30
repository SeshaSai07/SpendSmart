export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food-dining', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' }, // orange
  { id: 'transportation', name: 'Transportation', icon: 'Car', color: '#0ea5e9' }, // sky
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' }, // pink
  { id: 'bills-utilities', name: 'Bills & Utilities', icon: 'Zap', color: '#eab308' }, // yellow
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6' }, // purple
  { id: 'healthcare', name: 'Healthcare', icon: 'HeartPulse', color: '#ef4444' }, // red
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#3b82f6' }, // blue
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#14b8a6' }, // teal
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#6366f1' }, // indigo
  { id: 'other-expense', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' }, // slate
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#10b981' }, // emerald
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#06b6d4' }, // cyan
  { id: 'business', name: 'Business', icon: 'TrendingUp', color: '#84cc16' }, // lime
  { id: 'investment', name: 'Investment', icon: 'Coins', color: '#f59e0b' }, // amber
  { id: 'gift', name: 'Gift', icon: 'Gift', color: '#a855f7' }, // purple
  { id: 'other-income', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' }, // slate
];

export const ALL_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES.filter(c => !DEFAULT_EXPENSE_CATEGORIES.some(e => e.name === c.name)),
];

export function getCategoryByName(name, type = 'expense') {
  const list = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const found = list.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
  if (found) return found;
  return { id: 'other', name: name || 'Other', icon: 'Tag', color: '#64748b' };
}

