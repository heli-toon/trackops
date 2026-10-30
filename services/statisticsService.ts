import { Timestamp } from "firebase/firestore";
import { TransactionType } from "@/types";

export type StatisticsRange = "this-month" | "previous-month" | "all-time";

export type StatisticsDateRange = {
  start: Date | null;
  end: Date | null;
};

export type CategoryStatistic = {
  categoryId: string;
  amountMinor: number;
  percentage: number;
};

export type DailyStatistic = {
  date: string;
  amountMinor: number;
};

export type TransactionStatistics = {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  spendingChangePercent: number | null;
  byCategory: CategoryStatistic[];
  dailySpending: DailyStatistic[];
  largestExpenses: TransactionType[];
};

const toDate = (value: Date | Timestamp): Date =>
  value instanceof Timestamp ? value.toDate() : value;

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

export function getStatisticsDateRange(
  range: StatisticsRange,
  now = new Date(),
): StatisticsDateRange {
  if (range === "all-time") {
    return { start: null, end: null };
  }

  const monthOffset = range === "this-month" ? 0 : -1;
  const month = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return { start: startOfMonth(month), end: endOfMonth(month) };
}

export function filterTransactionsByDateRange(
  transactions: TransactionType[],
  dateRange: StatisticsDateRange,
): TransactionType[] {
  return transactions.filter((transaction) => {
    const date = toDate(transaction.date);
    return (
      (!dateRange.start || date >= dateRange.start) &&
      (!dateRange.end || date <= dateRange.end)
    );
  });
}

export function calculateStatistics(
  transactions: TransactionType[],
  dateRange: StatisticsDateRange,
  comparisonTransactions: TransactionType[] = [],
): TransactionStatistics {
  const filteredTransactions = filterTransactionsByDateRange(
    transactions,
    dateRange,
  );
  const incomeMinor = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amountMinor, 0);
  const expenseTransactions = filteredTransactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const expenseMinor = expenseTransactions.reduce(
    (total, transaction) => total + transaction.amountMinor,
    0,
  );
  const comparisonExpenseMinor = comparisonTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amountMinor, 0);

  const byCategoryMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();
  expenseTransactions.forEach((transaction) => {
    byCategoryMap.set(
      transaction.categoryId,
      (byCategoryMap.get(transaction.categoryId) ?? 0) +
        transaction.amountMinor,
    );
    const date = toDate(transaction.date);
    const day = startOfDay(date).toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + transaction.amountMinor);
  });

  const byCategory = [...byCategoryMap.entries()]
    .map(([categoryId, amountMinor]) => ({
      categoryId,
      amountMinor,
      percentage: expenseMinor ? (amountMinor / expenseMinor) * 100 : 0,
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor);

  const dailySpending = [...dailyMap.entries()]
    .map(([date, amountMinor]) => ({ date, amountMinor }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    incomeMinor,
    expenseMinor,
    netMinor: incomeMinor - expenseMinor,
    spendingChangePercent:
      comparisonExpenseMinor === 0
        ? null
        : ((expenseMinor - comparisonExpenseMinor) /
            comparisonExpenseMinor) *
          100,
    byCategory,
    dailySpending,
    largestExpenses: [...expenseTransactions]
      .sort((a, b) => b.amountMinor - a.amountMinor)
      .slice(0, 5),
  };
}
