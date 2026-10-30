import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { FinanceProvider } from '../context/FinanceContext';

describe('SpendSmart User Workflows & Component Testing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders initial dashboard empty state with helpful guidance and action buttons', async () => {
    render(
      <FinanceProvider>
        <App />
      </FinanceProvider>
    );

    // Check Welcome banner
    expect(await screen.findByText(/Welcome to SpendSmart/i)).toBeInTheDocument();
    expect(screen.getByText(/Take complete control of your financial journey/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Add First Transaction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Sample Data/i })).toBeInTheDocument();
  });

  it('allows loading sample data and populating dashboard summary figures', async () => {
    render(
      <FinanceProvider>
        <App />
      </FinanceProvider>
    );

    const loadDemoBtn = await screen.findByRole('button', { name: /Load Sample Data/i });
    fireEvent.click(loadDemoBtn);

    // Check that recent transaction is present (one of top 5 recent)
    await waitFor(() => {
      expect(screen.getByText(/Online Tech Course Subscription/i)).toBeInTheDocument();
    });

    // Verify summary figures update (Total Income and Expenses are present)
    expect(screen.getByText(/Total Income/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
  });

  it('allows creating a transaction and displaying it in list', async () => {
    const { container } = render(
      <FinanceProvider>
        <App />
      </FinanceProvider>
    );

    // Open Add Transaction modal
    const addBtn = screen.getByRole('button', { name: /\+ Add First Transaction/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText(/Record Transaction/i)).toBeInTheDocument();

    // Fill form
    const descInput = screen.getByPlaceholderText(/e\.g\. Grocery store/i);
    const amountInput = screen.getByPlaceholderText('0.00');

    fireEvent.change(descInput, { target: { value: 'Organic Vegetables' } });
    fireEvent.change(amountInput, { target: { value: '450' } });

    // Submit using the form submit button
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    // Verify transaction shows on dashboard recent
    await waitFor(() => {
      expect(screen.getByText('Organic Vegetables')).toBeInTheDocument();
    });
  });
});
