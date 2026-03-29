# Vyapar Book - Small Business Accounting App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Expense tracking**: Enter expenses with categories (Rent, Stock Purchase, Power Bill, Transport, Miscellaneous, custom), tags, date, amount, account (Cash or Bank)
- **Sales tracking**: Enter daily sales with separate Cash and Online fields. Online sales auto-credited to Bank account.
- **Gross Profit entry**: Manual entry of gross profit figure
- **Cash Book / Ledger**: Credit/debit entries for Cash and Bank accounts with running balance
- **Account balances**: Cash account and Bank account with real-time balance
- **Custom categories**: Create and manage custom expense categories
- **Tags**: Create and assign tags to transactions for analysis
- **Profit/Loss calculation**: Gross Profit minus expenses (excluding Stock Purchase) = Net Profit/Loss
- **Analytics**:
  - Category-wise expense breakdown (pie/bar chart)
  - Monthly and yearly profit/loss
  - Filters: month dropdown or date range picker
  - Cash vs Online sales breakdown

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data types: Expense, Sale, GrossProfitEntry, CashBookEntry, Category, Tag
   - CRUD for expenses, sales, gross profit entries
   - Cash book credit/debit entries
   - Account balance computation (Cash, Bank)
   - Custom category management
   - Tag management
   - Analytics queries: category totals, monthly/yearly profit, date range filters
   - Auto-credit bank when online sale entered

2. Frontend:
   - Bottom nav: Dashboard, Sales, Expenses, Cash Book, Analytics
   - Dashboard: account balances, today's summary, recent transactions
   - Sales entry form: date, cash amount, online amount (auto-bank credit)
   - Expense entry form: date, category, amount, account (cash/bank), tags, notes
   - Gross Profit entry form
   - Cash Book: list of debit/credit entries per account with running balance
   - Analytics: charts for category spend, profit/loss with month/year/date-range filter
   - Settings: manage categories and tags
   - Mobile-first responsive design (Android-friendly)
   - Currency: Indian Rupees (₹)
