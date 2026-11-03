# TrackOps: Suggested Next Steps

TrackOps is an intuitive personal expense and finance tracker built with Expo, React Native, and Firebase.
The core workflows—authentication, wallets, transactions, statistics, budgets, dynamic dashboard totals, user preferences/currencies, and security rules—are implemented and tested.

This document is a practical roadmap for maintaining and extending the project. Completed items are marked with ✅. Items requiring manual or external setup are noted and detailed in [`MANUAL_SETUP.md`](./MANUAL_SETUP.md).

---

## 1. Stabilize the current app ✅

Make the project easy to run, test, and maintain:

- ✅ Confirm Firebase environment variables and Google OAuth client IDs are documented and available locally (`.env.example` provided; see [`MANUAL_SETUP.md`](./MANUAL_SETUP.md)).
- ✅ Fix existing TypeScript errors:
  - ✅ The bottom-tab type mismatch in `app/(tabs)/_layout.tsx`.
  - ✅ The React Native Firebase persistence import in `config/firebase.ts`.
- ✅ Restore a working lint command and add a formatter if desired (0 errors, 0 warnings with `bun run lint`).
- ✅ Add a test setup for authentication, calculations, validation, and transaction helpers (Jest configured with `jest-expo`, AsyncStorage mock; 22 unit tests passing).
- ✅ Remove or rotate any credentials stored in local files such as `secrets.txt`. Never commit passwords, tokens, or service-account keys (`secrets.txt` untracked from git index and ignored in `.gitignore`; see [`MANUAL_SETUP.md`](./MANUAL_SETUP.md) for password rotation).
- ✅ Decide whether the project will use npm, Bun, or another package manager and keep the documentation and lockfile consistent (Bun).

---

## 2. Define the expense-tracking data model ✅

The app stores each transaction under the authenticated user:

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

The transaction, wallet, category, budget, and user-preference TypeScript models and typed Firestore services are in place. Amounts use integer minor units instead of floating-point values.

Supporting collections and documents:

- ✅ Wallets and account balances (`services/walletService.ts`).
- ✅ User-defined categories (`services/categoryService.ts`).
- ✅ Monthly budgets (`services/budgetService.ts`).
- ✅ User preferences, including currency and locale (`services/preferencesService.ts`, `contexts/preferencesContext.tsx`).
- ✅ Define transaction, wallet, category, budget, and user-preference models and typed Firestore services.

---

## 3. Build the minimum viable transaction flow ✅

Record and manage income and expenses:

1. ✅ Add transaction form (`app/(modals)/transactionModal.tsx`).
2. ✅ Select income or expense.
3. ✅ Enter amount, date, description, wallet, and category.
4. ✅ Validate required fields and reject invalid or negative values (`utils/transactionValidation.ts`).
5. ✅ Save transaction to Firestore (`services/transactionService.ts`).
6. ✅ Display recent transactions on the home screen (`app/(tabs)/index.tsx`).
7. ✅ Support editing and deleting transactions.
8. ✅ Show loading, empty, offline, and error states.

---

## 4. Finish the wallet experience ✅

The wallet screens support:

- ✅ Creating and editing wallets.
- ✅ An opening balance and dynamic current balance.
- ✅ Income and expense totals per wallet.
- Wallet-to-wallet transfers are deferred to a future milestone.
- ✅ Wallets with transactions cannot be deleted; empty wallets can be deleted.

---

## 5. Implement useful statistics ✅

The statistics screen derives its data from transactions:

- ✅ Spending this month compared with the previous month.
- ✅ Spending by category with progress indicators.
- ✅ Income versus expenses and net balance.
- ✅ Daily spending trends.
- ✅ Top categories and largest transactions.
- ✅ Date-range filtering (this month, last month, all time).

---

## 6. Add budgets and recurring expenses ✅

Manage budgets and spending limits:

- ✅ Monthly category budgets (`app/budgets.tsx`).
- ✅ Progress indicators and overspending warnings.
- Recurring income and expenses (deferred until advanced automation milestone).
- Optional reminders for recurring transactions (deferred with automation).
- ✅ Budget history view.

---

## 7. Improve authentication and account management ✅

Authentication flow and user account management:

- ✅ Password reset.
- ✅ Email verification.
- ✅ Sign-out.
- ✅ Account deletion with confirmation.
- ✅ Profile screen with avatar, display name, verification status, and provider.
- ✅ Handling for accounts using different sign-in providers (Email/Password & Google).
- ✅ Tighten Firestore security rules (`firestore.rules` enforces user isolation).

---

## 8. Improve reliability and user experience ✅

Important states handled throughout the app:

- ✅ First launch and onboarding.
- ✅ Empty transaction history and empty wallet states.
- ✅ Slow network requests with loading indicators.
- ✅ Firestore permission failures handled gracefully (`utils/firestoreError.ts`).
- ✅ Offline mode and retry actions with actionable feedback.
- ✅ Duplicate submissions prevented while authentication and form requests are in progress.
- ✅ Keyboard behavior handled with `KeyboardAvoidingView` for transaction, wallet, and profile forms.
- ✅ Accessible labels and roles covering primary transaction, wallet, budget, and profile actions.
- ✅ Currency formatting based on user preference (`utils/currency.ts`, `contexts/preferencesContext.tsx`, and `app/(modals)/settingsModal.tsx`).

---

## 9. Implementation Milestones Status

### Milestone 1: Foundation ✅
- ✅ Fix TypeScript and lint issues.
- ✅ Add transaction and wallet types.
- ✅ Add Firestore service modules.
- ✅ Add basic unit tests for validation, calculations, currency, and error handling.

### Milestone 2: Transactions ✅
- ✅ Build add-transaction form.
- ✅ Save and list transactions.
- ✅ Add edit and delete actions.
- ✅ Add category selection.

### Milestone 3: Wallets and dashboard ✅
- ✅ Finish wallet CRUD.
- ✅ Calculate dynamic balances.
- ✅ Replace hard-coded dashboard totals (total balance, monthly income, monthly expenses cards).
- ✅ Add recent-transaction summaries.

### Milestone 4: Statistics and budgets ✅
- ✅ Add category and time-based statistics.
- ✅ Add monthly budgets.
- ✅ Add spending progress and warnings.

### Milestone 5: Production readiness
- ✅ Add password reset and account deletion.
- ✅ Tighten Firestore security rules (`firestore.rules` created).
- ✅ Add tests for core flows (validation, budget calculations, statistics calculations, currency, error handling).
- ⚠️ Test Android, iOS, and web behavior (see [`MANUAL_SETUP.md`](./MANUAL_SETUP.md)).
- ⚠️ Configure release builds and monitoring (see [`MANUAL_SETUP.md`](./MANUAL_SETUP.md)).

---

## 10. Next Recommended Features (Future Milestones)

Once production deployment and device testing are complete:
1. **Wallet Transfers:** Support moving funds between two wallets with corresponding transfer records.
2. **Recurring Transactions:** Set up scheduled monthly bills or subscriptions.
3. **Data Export / Backup:** Allow exporting transactions to CSV or JSON from the Settings screen.
