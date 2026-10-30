# SpendSmart — Personal Finance Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://spend-smart-two-eta.vercel.app/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

> 🚀 **Live Production App**: **[https://spend-smart-two-eta.vercel.app/](https://spend-smart-two-eta.vercel.app/)**

SpendSmart is a modern, responsive, and privacy-focused personal finance tracking web application built with **React**, **Vite**, **Tailwind CSS**, and **Recharts**. It is engineered to operate 100% offline using browser-local persistence (`localStorage`), requiring zero backend servers, accounts, or cloud databases.

---

## 🔗 Live Application

The project is deployed on Vercel and available to test immediately:
👉 **[https://spend-smart-two-eta.vercel.app/](https://spend-smart-two-eta.vercel.app/)**

---

## 🌟 Key Features

1. **Financial Dashboard**
   - **Real-Time Key Metrics**: Monthly Total Income, Total Expenses, Net Balance, and Savings Rate (with strict division-by-zero protection; displays "Not available" when income is 0).
   - **Income vs Expense Flow**: 6-month visual trends using Recharts.
   - **Category Spending Distribution**: Interactive donut chart with color-coded legends.
   - **Monthly Budget Overview**: Immediate tracking against categorical spending limits.
   - **Recent Activity**: Quick view of latest transactions for the active month.

2. **Transaction Management**
   - **Create & Edit**: Positive amounts only, category classification, local calendar dates, and optional notes.
   - **Delete Protection**: Modal confirmation dialog before deleting records.
   - **Multi-Dimensional Filtering**: Real-time search across descriptions and notes, type filter (Income/Expense), category filter, and monthly period filter.
   - **Dynamic Sorting**: By date (newest/oldest) or amount (highest/lowest).
   - **CSV Export**: One-click download of all filtered transactions to standard CSV format.

3. **Monthly Budgets & Alert Thresholds**
   - Set monthly spending limits per category.
   - Track actual spending against limits in real time.
   - Three-tier alert thresholds:
     - 🟢 **On Track** (`< 80%`)
     - 🟡 **Approaching Limit** (`80% – 99.9%`)
     - 🔴 **Exceeded** (`≥ 100%`)
   - Text status labels paired with accessible colors (ensuring WCAG compliance so color is never the sole information carrier).

4. **Analytics & Historical Cashflow**
   - 6-month and 12-month net balance progression area charts.
   - Categorical breakdown for both income streams and expense channels.

5. **Data Portability & Offline Persistence**
   - **Schema-Versioned Storage**: Stored with schema version `1.0.0` with error recovery and quota warnings.
   - **Full JSON Backup & Restore**: Download complete encrypted snapshot and restore anytime with strict schema validation.
   - **Automatic Pre-Restore Snapshot**: Automatically downloads a safety backup before overwriting existing data.
   - **Opt-in Demonstration Data**: Allows instant exploration with sample records without polluting fresh starts.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Data Visualizations**: [Recharts 2](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📋 Prerequisites & Compatible Node.js

- **Node.js**: `v18.0.0` or higher (verified on Node `v22.12.0`)
- **Package Manager**: `npm` `v9.0.0` or higher (verified on npm `10.9.0`)

---

## 🚀 Getting Started

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm run test
```
Runs 21 unit and integration tests covering calculation formulas, date boundaries, budget thresholds, storage recovery, and component workflows.

To run tests in watch mode:
```bash
npm run test:watch
```

### 4. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 📂 Project Architecture

```
Finance-tracker/
├── dist/                      # Production build output
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── common/            # Modal, ConfirmDialog, CategoryIcon
│   │   ├── layout/            # Sidebar, Sticky Header
│   │   ├── dashboard/         # DashboardPage, metric cards, mini charts
│   │   ├── transactions/      # TransactionsPage, TransactionModal
│   │   ├── budgets/           # BudgetsPage, threshold meters
│   │   ├── charts/            # AnalyticsPage, historical cashflows
│   │   └── settings/          # SettingsPage, backup export/import
│   ├── context/
│   │   └── FinanceContext.jsx # Central state management & storage sync
│   ├── data/
│   │   ├── defaultCategories.js # Standard expense & income category definitions
│   │   └── sampleData.js        # Realistic opt-in demo datasets
│   ├── test/                  # Test setup and integration tests
│   ├── utils/
│   │   ├── calculations.js    # Financial metrics, totals, trends, budget statuses
│   │   ├── currency.js        # Intl.NumberFormat currency formatters
│   │   ├── dates.js           # Local calendar date utilities (avoids UTC shift)
│   │   ├── exportImport.js    # CSV generation and validated JSON restore
│   │   ├── storage.js         # Safe localStorage wrapper with versioning
│   │   └── validators.js      # Input sanitization and error messages
│   ├── App.jsx                # Main layout and tab orchestrator
│   ├── index.css              # Tailwind base imports and custom scrollbars
│   └── main.jsx               # React DOM entrypoint
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 💾 Data Model & Storage

### Transaction Model
```typescript
interface Transaction {
  id: string;              // Unique prefix ID e.g., 'tx_173026...'
  description: string;     // Max 100 characters
  amount: number;          // Strictly positive floating point (2 decimals)
  type: 'income' | 'expense';
  category: string;        // Categorical identifier
  date: string;            // 'YYYY-MM-DD' in local calendar date
  notes?: string;          // Optional user notes or reference
  createdAt: string;       // ISO timestamp
  updatedAt?: string;      // ISO timestamp
}
```

### Budget Model
```typescript
interface Budget {
  id: string;              // 'bg_...'
  category: string;        // Target expense category
  month: string;           // 'YYYY-MM'
  amount: number;          // Monthly limit (positive number)
}
```

### LocalStorage Schema Versioning
- Storage keys:
  - `spendsmart_v1_transactions`
  - `spendsmart_v1_budgets`
  - `spendsmart_v1_settings`
- All reads and writes are wrapped with try/catch handlers.
- Corrupted JSON payloads do not overwrite existing stored data and trigger user notifications.
- Storage quota limits (`QuotaExceededError`) surface non-blocking alerts with recommendations to export older records.

---

## 🔒 Privacy & Data Limitations

- **Browser-Local Only**: All data is stored in the user's browser. No data is transmitted to external servers, APIs, or analytics vendors.
- **Not Encrypted**: LocalStorage is unencrypted plain text accessible within the browser origin. Do not store actual credit card numbers, CVVs, or bank login credentials.
- **Device Isolation**: Data does not sync automatically across multiple browsers or machines. Use the **Export JSON** and **Restore from Backup** features in Settings to move data between devices.

---

## 🧪 Manual Testing Checklist

| Step | Test Action | Expected Result |
| :--- | :--- | :--- |
| 1 | First load on empty browser | Welcome banner displayed; zero totals; no errors |
| 2 | Click "Load Sample Data" | Totals update dynamically; charts render; recent transactions populate |
| 3 | Add Income transaction (₹50,000) | Net balance increases; savings rate recalculates |
| 4 | Add Expense transaction (₹10,000) | Category breakdown donut updates; remaining balance decreases |
| 5 | Overspend on a Budget category | Category budget card displays red badge (`Budget exceeded`) |
| 6 | Filter by Category / Type / Search | Transaction table filters smoothly; filter totals update |
| 7 | Export CSV | Browser triggers download of standard `.csv` file |
| 8 | Export Backup JSON | Validated `.json` file downloads with schema version |
| 9 | Wipe Data | Confirmation dialog prompts; storage clears safely |
| 10 | Restore Backup JSON | Schema validated; preview shown; data restores cleanly |

---

## 🛠️ Troubleshooting

- **Chart not displaying**: Recharts requires container width and height. Ensure the browser window is sized reasonably and flex containers have explicit heights (`h-64` / `h-72`).
- **Data missing after browser close**: Check if your browser is configured in "Private/Incognito Mode" or set to auto-clear site cookies/storage upon exit.
- **Quota Exceeded Error**: Open **Settings & Data**, click **Export JSON Backup**, and reset older months if local storage reaches capacity.
