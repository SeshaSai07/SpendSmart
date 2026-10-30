/**
 * Realistic opt-in sample dataset for demonstrations.
 * New users start clean with empty states. This can be explicitly loaded via Settings or banner.
 */

import { getCurrentMonthKey } from '../utils/dates';

export function getSampleData() {
  const currentMonth = getCurrentMonthKey();
  const [yearStr, monthStr] = currentMonth.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);

  // Pad helper
  const pad = n => String(n).padStart(2, '0');
  const d1 = `${y}-${pad(m)}-01`;
  const d3 = `${y}-${pad(m)}-03`;
  const d5 = `${y}-${pad(m)}-05`;
  const d8 = `${y}-${pad(m)}-08`;
  const d12 = `${y}-${pad(m)}-12`;
  const d15 = `${y}-${pad(m)}-15`;
  const d18 = `${y}-${pad(m)}-18`;
  const d22 = `${y}-${pad(m)}-22`;

  const sampleTransactions = [
    {
      id: 'tx_sample_1',
      description: 'Monthly Salary Credit',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      date: d1,
      notes: 'Direct deposit from employer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_2',
      description: 'Apartment Rent',
      amount: 22000,
      type: 'expense',
      category: 'Housing',
      date: d3,
      notes: 'Monthly flat rent',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_3',
      description: 'Supermarket Groceries',
      amount: 5400,
      type: 'expense',
      category: 'Food & Dining',
      date: d5,
      notes: 'Fresh veggies, dairy and staples',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_4',
      description: 'Freelance Design Work',
      amount: 15000,
      type: 'income',
      category: 'Freelance',
      date: d8,
      notes: 'Landing page revamp milestone',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_5',
      description: 'Electricity & Broadband Bill',
      amount: 3200,
      type: 'expense',
      category: 'Bills & Utilities',
      date: d12,
      notes: 'Fiber 200Mbps + electricity',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_6',
      description: 'Weekend Dining & Cafe',
      amount: 2600,
      type: 'expense',
      category: 'Food & Dining',
      date: d15,
      notes: 'Dinner with college friends',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_7',
      description: 'Metro Smart Card Recharge & Fuel',
      amount: 2800,
      type: 'expense',
      category: 'Transportation',
      date: d18,
      notes: 'Commute expenses',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_sample_8',
      description: 'Online Tech Course Subscription',
      amount: 1499,
      type: 'expense',
      category: 'Education',
      date: d22,
      notes: 'Fullstack certification',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleBudgets = [
    {
      id: 'bg_sample_1',
      category: 'Food & Dining',
      amount: 10000,
      month: currentMonth,
    },
    {
      id: 'bg_sample_2',
      category: 'Housing',
      amount: 25000,
      month: currentMonth,
    },
    {
      id: 'bg_sample_3',
      category: 'Transportation',
      amount: 4000,
      month: currentMonth,
    },
    {
      id: 'bg_sample_4',
      category: 'Bills & Utilities',
      amount: 4000,
      month: currentMonth,
    },
  ];

  return {
    transactions: sampleTransactions,
    budgets: sampleBudgets,
  };
}

