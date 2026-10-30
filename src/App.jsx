import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TransactionsPage } from './components/transactions/TransactionsPage';
import { BudgetsPage } from './components/budgets/BudgetsPage';
import { AnalyticsPage } from './components/charts/AnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { TransactionModal } from './components/transactions/TransactionModal';
import { useFinance } from './context/FinanceContext';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const { storageError, setStorageError, isInitialized } = useFinance();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Real-time financial summary and key metrics',
        };
      case 'transactions':
        return {
          title: 'Transactions',
          subtitle: 'Search, filter, and manage your income & expenses',
        };
      case 'budgets':
        return {
          title: 'Monthly Budgets',
          subtitle: 'Set and track spending limits by category',
        };
      case 'analytics':
        return {
          title: 'Financial Analytics',
          subtitle: 'In-depth trends, cashflows, and categorical distributions',
        };
      case 'settings':
        return {
          title: 'Settings & Data Management',
          subtitle: 'Currencies, CSV export, and complete offline JSON backups',
        };
      default:
        return { title: 'Dashboard', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Initializing SpendSmart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Header with Month Nav & Quick Actions */}
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenNewTransaction={handleOpenNewTransaction}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Storage Warning Banner if any */}
        {storageError && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Storage notice: {storageError}</span>
            </div>
            <button
              onClick={() => setStorageError(null)}
              className="p-1 hover:bg-amber-500/20 rounded-md"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setCurrentTab}
              onOpenNewTransaction={handleOpenNewTransaction}
            />
          )}
          {currentTab === 'transactions' && (
            <TransactionsPage onEditTransaction={handleEditTransaction} />
          )}
          {currentTab === 'budgets' && <BudgetsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Reusable Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
}

