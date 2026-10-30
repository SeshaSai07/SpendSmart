import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export function Sidebar({ currentTab, onSelectTab, isMobileOpen, setIsMobileOpen }) {
  const { darkMode, toggleDarkMode } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-navy-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight leading-none">
              Spend<span className="text-emerald-500">Smart</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium tracking-wide uppercase mt-1">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-navy-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & dark mode toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-navy-800 space-y-3">
          <button
            onClick={toggleDarkMode}
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-800/70 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Toggle theme mode"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {darkMode ? 'Dark Theme' : 'Light Theme'}
            </span>
            <span className="text-[10px] bg-slate-200 dark:bg-navy-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
              {darkMode ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="px-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>SpendSmart v1.0</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Local Only
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

