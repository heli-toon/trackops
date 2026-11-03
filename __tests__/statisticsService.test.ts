import {
  getStatisticsDateRange,
  filterTransactionsByDateRange,
  calculateStatistics,
} from "../services/statisticsService";
import { TransactionType } from "../types";

describe("statisticsService", () => {
  const baseDate = new Date(2026, 10, 15); // November 15, 2026

  it("calculates statistics date ranges accurately", () => {
    const thisMonth = getStatisticsDateRange("this-month", baseDate);
    expect(thisMonth.start).toEqual(new Date(2026, 10, 1));
    expect(thisMonth.end).toEqual(new Date(2026, 10, 30, 23, 59, 59, 999));

    const previousMonth = getStatisticsDateRange("previous-month", baseDate);
    expect(previousMonth.start).toEqual(new Date(2026, 9, 1));
    expect(previousMonth.end).toEqual(new Date(2026, 9, 31, 23, 59, 59, 999));

    const allTime = getStatisticsDateRange("all-time", baseDate);
    expect(allTime.start).toBeNull();
    expect(allTime.end).toBeNull();
  });

  it("filters transactions by date range", () => {
    const transactions: TransactionType[] = [
      {
        id: "1",
        type: "expense",
        amountMinor: 2000,
        categoryId: "food",
        description: "Groceries",
        date: new Date(2026, 10, 5),
      },
      {
        id: "2",
        type: "expense",
        amountMinor: 5000,
        categoryId: "tech",
        description: "Monitor",
        date: new Date(2026, 9, 20),
      },
    ];

    const novRange = getStatisticsDateRange("this-month", baseDate);
    const filtered = filterTransactionsByDateRange(transactions, novRange);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("calculates statistics including totals, breakdown by category, and daily spending", () => {
    const transactions: TransactionType[] = [
      {
        id: "1",
        type: "income",
        amountMinor: 500000, // 5000
        categoryId: "salary",
        description: "Job",
        date: new Date(2026, 10, 1),
      },
      {
        id: "2",
        type: "expense",
        amountMinor: 10000, // 100
        categoryId: "food",
        description: "Dinner",
        date: new Date(2026, 10, 2),
      },
      {
        id: "3",
        type: "expense",
        amountMinor: 30000, // 300
        categoryId: "food",
        description: "Groceries",
        date: new Date(2026, 10, 2),
      },
      {
        id: "4",
        type: "expense",
        amountMinor: 20000, // 200
        categoryId: "transport",
        description: "Fuel",
        date: new Date(2026, 10, 3),
      },
    ];

    const comparisonTransactions: TransactionType[] = [
      {
        id: "prev-1",
        type: "expense",
        amountMinor: 40000, // 400 in prev period
        categoryId: "food",
        description: "Prev food",
        date: new Date(2026, 9, 10),
      },
    ];

    const range = getStatisticsDateRange("this-month", baseDate);
    const stats = calculateStatistics(transactions, range, comparisonTransactions);

    expect(stats.incomeMinor).toBe(500000);
    expect(stats.expenseMinor).toBe(60000); // 10000 + 30000 + 20000
    expect(stats.netMinor).toBe(440000);

    // Spending change: current = 60000, comparison = 40000 -> ((60000 - 40000) / 40000) * 100 = +50%
    expect(stats.spendingChangePercent).toBe(50);

    // By category
    expect(stats.byCategory).toHaveLength(2);
    expect(stats.byCategory[0].categoryId).toBe("food");
    expect(stats.byCategory[0].amountMinor).toBe(40000);
    expect(stats.byCategory[0].percentage).toBeCloseTo((40000 / 60000) * 100);

    expect(stats.byCategory[1].categoryId).toBe("transport");
    expect(stats.byCategory[1].amountMinor).toBe(20000);

    // Largest expenses
    expect(stats.largestExpenses).toHaveLength(3);
    expect(stats.largestExpenses[0].id).toBe("3"); // 30000
    expect(stats.largestExpenses[1].id).toBe("4"); // 20000
    expect(stats.largestExpenses[2].id).toBe("2"); // 10000
  });
});
