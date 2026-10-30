import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Database,
  Coins,
  FileCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';
import {
  exportFullBackupJSON,
  exportTransactionsToCSV,
  validateImportJSON,
} from '../../utils/exportImport';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';

export function SettingsPage() {
  const {
    currency,
    updateCurrency,
    transactions,
    budgets,
    darkMode,
    resetAllData,
    restoreBackupData,
    loadDemoData,
  } = useFinance();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    exportFullBackupJSON(transactions, budgets, { currency, darkMode });
    showNotification('Backup exported successfully.');
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }
    exportTransactionsToCSV(transactions, `spendsmart-all-transactions-${Date.now()}.csv`);
    showNotification('Transactions exported as CSV.');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const validation = validateImportJSON(parsed);
        if (!validation.valid) {
          setImportError(validation.error || 'Failed to validate backup schema.');
        } else {
          setImportPreview(validation);
        }
        setIsImportModalOpen(true);
      } catch (err) {
        setImportError('Invalid JSON file format. Could not parse backup.');
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview?.sanitized) return;

    // Optional: Auto export a safety backup before replacing
    if (transactions.length > 0) {
      try {
        exportFullBackupJSON(transactions, budgets, { currency, darkMode }, `spendsmart-pre-import-safety-backup.json`);
      } catch (err) {
        console.warn('Safety export failed, proceeding with import');
      }
    }

    restoreBackupData(importPreview.sanitized);
    setIsImportModalOpen(false);
    showNotification('Data successfully restored from backup.');
  };

  const showNotification = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-600" />
          <span>Currency & Regional Settings</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select your primary currency. Figures will be formatted using your local system locale conventions.
        </p>

        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Currency
          </label>
          <select
            value={currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Backup & Data Portability</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your data is stored strictly inside your browser’s localStorage. It is not encrypted, synced to any external server, or backed up automatically in the cloud. To protect your records or transfer to another device, create periodic backups.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className="flex flex-col items-start p-4 bg-slate-50 hover:bg-slate-100 dark:bg-navy-800 dark:hover:bg-navy-750 border border-slate-200/60 dark:border-navy-700 rounded-xl text-left transition-colors"
          >
            <Download className="w-5 h-5 text-emerald-600 mb-2" />
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
              Export JSON Backup
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Complete snapshot including transactions, budgets, and settings.
            </span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex flex-col items-start p-4 bg-slate-50 hover:bg-slate-100 dark:bg-navy-800 dark:hover:bg-navy-750 border border-slate-200/60 dark:border-navy-700 rounded-xl text-left transition-colors"
          >
            <FileCheck className="w-5 h-5 text-teal-600 mb-2" />
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
              Export CSV Spreadsheet
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Compatible with Excel, Google Sheets, and standard spreadsheet tools.
            </span>
          </button>

          {/* JSON Restore */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-start p-4 bg-slate-50 hover:bg-slate-100 dark:bg-navy-800 dark:hover:bg-navy-750 border border-slate-200/60 dark:border-navy-700 rounded-xl text-left transition-colors"
            >
              <Upload className="w-5 h-5 text-blue-600 mb-2" />
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                Restore from Backup
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Validate and restore data from a previously exported JSON backup file.
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Demo Data & Storage Reset</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {/* Sample Data Loader */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Load Sample Demonstration Data
              </h4>
              <p className="text-[11px] text-slate-400">
                Populate your workspace with sample expenses, salaries, and budgets to explore all analytics features.
              </p>
            </div>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 rounded-xl transition-colors shrink-0"
            >
              Load Sample Data
            </button>
          </div>

          {/* Wipe All Data */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Reset All Local Data
              </h4>
              <p className="text-[11px] text-slate-400">
                Permanently wipes all transactions, categories, and budgets stored in this browser.
              </p>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shrink-0 shadow-sm shadow-rose-600/30"
            >
              Wipe All Data
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title="Reset All Local Data"
        message="This action will delete all transactions and budgets from your browser. Are you sure you wish to proceed?"
        confirmText="Yes, Wipe Everything"
        isDestructive={true}
      />

      {/* Import Preview Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Restore Backup Verification"
      >
        {importError ? (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Backup validation failed:</p>
                <p className="mt-1">{importError}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              The backup file was verified successfully. Review what will be restored:
            </p>

            <div className="bg-slate-50 dark:bg-navy-800 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Transactions found:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {importPreview?.counts?.transactions ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Budgets found:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {importPreview?.counts?.budgets ?? 0}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Note: Restoring this file will overwrite existing data. A safety snapshot of your current dataset will be automatically downloaded before applying.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Confirm & Restore
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

