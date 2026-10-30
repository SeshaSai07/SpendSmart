import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Menu } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatMonthLabel, shiftMonthKey } from '../../utils/dates';

export function Header({ onOpenNewTransaction, onOpenMobileMenu, title, subtitle }) {
  const { selectedMonth, setSelectedMonth } = useFinance();

  const handlePrevMonth = () => {
    setSelectedMonth(shiftMonthKey(selectedMonth, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(shiftMonthKey(selectedMonth, 1));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-900/80 backdrop-blur border-b border-slate-200 dark:border-navy-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Month Selector & Quick Action Button */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Month Selector Pill */}
        <div className="flex items-center bg-slate-100 dark:bg-navy-800 rounded-xl p-1 border border-slate-200/60 dark:border-navy-700 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-navy-700 transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[110px] sm:min-w-[130px] text-center select-none">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-navy-700 transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenNewTransaction}
          type="button"
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-emerald-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}

