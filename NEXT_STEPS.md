# TrackOps: Suggested Next Steps

TrackOps is intended to become a personal expense tracker. The current project has
the beginnings of authentication, profile editing, wallet screens, and statistics,
but the core expense and transaction workflows are not finished yet.

This document is a practical roadmap for continuing the project.

## 1. Stabilize the current app

Before adding features, make the project easy to run and maintain:

- Confirm the Firebase environment variables and Google OAuth client IDs are
  documented and available locally.
- ✅ Fix the existing TypeScript errors:
  - ✅ The bottom-tab type mismatch in `app/(tabs)/_layout.tsx`.
  - ✅ The React Native Firebase persistence import in `config/firebase.ts`.
- ✅ Restore a working lint command and add a formatter if desired.
- Add a small test setup for authentication and transaction helpers.
- Remove or rotate any credentials that may have been stored in local files such
  as `secrets.txt`. Never commit passwords, tokens, or service-account keys.
- ✅ Decide whether the project will use npm, Bun, or another package manager and
  keep the documentation and lockfile consistent (Bun).

## 2. Define the expense-tracking data model ✅

The app needs a clear model before the screens can be completed. A useful first
version could store each transaction under the authenticated user:

```text
users/{uid}/transactions/{transactionId}
  type: "income" | "expense"
  amountMinor: number
  categoryId: string
  description: string
  date: Timestamp
  walletId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
```

The transaction, wallet, category, budget, and user-preference TypeScript
models and typed Firestore services are now in place. Amounts use integer minor
units instead of floating-point currency values.

Add supporting collections or documents for:

- ✅ Wallets and account balances.
- ✅ User-defined categories.
- ✅ Monthly budgets.
- ✅ User preferences, including currency and locale.

Amounts should be stored consistently, preferably as integer minor units
(for example, cents) rather than floating-point values.

- ✅ Define the transaction, wallet, category, budget, and user-preference
  models and typed Firestore services.

## 3. Build the minimum viable transaction flow ✅

The most important product milestone is allowing a user to record and manage
expenses:

1. ✅ Add a transaction form.
2. ✅ Select income or expense.
3. ✅ Enter an amount, date, description, wallet, and category.
4. ✅ Validate required fields and reject invalid or negative values.
5. ✅ Save the transaction to Firestore.
6. ✅ Display recent transactions on the home screen.
7. ✅ Support editing and deleting a transaction.
8. ✅ Show loading, empty, offline, and error states.

Create reusable Firestore service functions instead of placing database queries
directly in every screen.

## 4. Finish the wallet experience

The wallet screens currently appear to be starter or placeholder screens. Finish
them by supporting:

- Creating, editing, and deleting wallets.
- An opening balance and current balance.
- Income and expense totals per wallet.
- Moving money between wallets, if that fits the product.
- A clear rule for whether deleting a wallet is allowed when it has transactions.

Do not rely only on a stored balance that can become stale. Either calculate
balances from transactions or define a reliable update strategy using Firestore
transactions or server-side aggregation.

## 5. Implement useful statistics

Replace placeholder statistics with data derived from transactions:

- Spending this month compared with the previous month.
- Spending by category.
- Income versus expenses.
- Daily or weekly spending trends.
- Top categories and largest transactions.
- Date-range filtering.

Keep aggregation logic in a service or utility module so it can be tested
without rendering a screen.

## 6. Add budgets and recurring expenses

After the basic transaction flow works, add features that make the tracker more
useful:

- Monthly category budgets.
- Progress indicators and overspending warnings.
- Recurring income and expenses.
- Optional reminders for recurring transactions.
- A budget history view.

Start with monthly budgets only. Avoid adding notifications or recurring
automation until the underlying transaction model is stable.

## 7. Improve authentication and account management

The project now supports email/password authentication and Google sign-in.
Continue by adding:

- Password reset.
- Email verification.
- Sign-out.
- Account deletion.
- A clear profile screen with the user's photo and display name.
- Handling for accounts that use different sign-in providers.

Review Firebase Authentication and Firestore rules before production. A user
should only be able to read and write their own documents.

## 8. Improve reliability and user experience

Important states to handle throughout the app:

- First launch and onboarding.
- Empty transaction history.
- Slow network requests.
- Firestore permission failures.
- Offline mode and retry actions.
- Duplicate submissions.
- Keyboard and safe-area behavior on forms.
- Accessible labels and sufficient color contrast.
- Currency formatting based on the user's selected currency.

Use confirmation prompts for destructive actions such as deleting transactions,
wallets, or the account.

## 9. Suggested implementation order

Work in small milestones that leave the app usable:

### Milestone 1: Foundation

- Fix TypeScript and lint issues.
- ✅ Add transaction and wallet types.
- ✅ Add Firestore service modules.
- Add basic unit tests for validation and calculations.

### Milestone 2: Transactions

- Build the add-transaction form.
- Save and list transactions.
- Add edit and delete actions.
- Add category selection.

### Milestone 3: Wallets and dashboard

- Finish wallet CRUD.
- Calculate balances.
- Replace hard-coded dashboard totals.
- Add recent-transaction summaries.

### Milestone 4: Statistics and budgets

- Add category and time-based statistics.
- Add monthly budgets.
- Add spending progress and warnings.

### Milestone 5: Production readiness

- Add password reset and account deletion.
- Tighten Firestore security rules.
- Add tests for core flows.
- Test Android, iOS, and web behavior.
- Configure release builds and monitoring.

## 10. A good first coding task

The best next task is to implement the transaction model and a basic
`AddTransaction` screen. It creates the foundation for the dashboard, wallets,
statistics, and budgets while providing the first complete expense-tracking
workflow.

Keep the first version deliberately small: one currency, a fixed list of
categories, one wallet, and income/expense transactions. Expand the model only
after saving, listing, editing, and deleting transactions works reliably.
