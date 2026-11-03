import {
  calculateBudgetStatuses,
  getMonthKey,
} from "../services/budgetService";
import { BudgetType, TransactionType } from "../types";

describe("budgetService", () => {
  it("generates correct month keys", () => {
    const testDate = new Date(2026, 4, 12); // May 2026
    expect(getMonthKey(testDate)).toBe("2026-05");

    const janDate = new Date(2026, 0, 1);
    expect(getMonthKey(janDate)).toBe("2026-01");
  });

  it("calculates budget statuses accurately", () => {
    const month = "2026-11";
    const budgets: BudgetType[] = [
      {
        id: "b1",
        month: "2026-11",
        categoryId: "groceries",
        amountMinor: 50000, // 500
      },
      {
        id: "b2",
        month: "2026-11",
        categoryId: "entertainment",
        amountMinor: 20000, // 200
      },
      {
        id: "b3",
        month: "2026-10", // Different month
        categoryId: "groceries",
        amountMinor: 40000,
      },
    ];

    const transactions: TransactionType[] = [
      {
        id: "t1",
        type: "expense",
        amountMinor: 30000, // 300 spent on groceries
        categoryId: "groceries",
        description: "Weekly food",
        date: new Date(2026, 10, 5),
      },
      {
        id: "t2",
        type: "expense",
        amountMinor: 25000, // 250 spent on entertainment (overspent!)
        categoryId: "entertainment",
        description: "Concert",
        date: new Date(2026, 10, 8),
      },
      {
        id: "t3",
        type: "income",
        amountMinor: 100000, // income should be ignored
        categoryId: "groceries",
        description: "Refund",
        date: new Date(2026, 10, 9),
      },
      {
        id: "t4",
        type: "expense",
        amountMinor: 10000, // different month transaction
        categoryId: "groceries",
        description: "Old groceries",
        date: new Date(2026, 9, 25),
      },
    ];

    const statuses = calculateBudgetStatuses(budgets, transactions, month);

    expect(statuses).toHaveLength(2); // Only November budgets

    // Sorted by categoryId: entertainment, groceries
    const entStatus = statuses.find((s) => s.budget.categoryId === "entertainment");
    expect(entStatus).toBeDefined();
    expect(entStatus?.spentMinor).toBe(25000);
    expect(entStatus?.remainingMinor).toBe(-5000);
    expect(entStatus?.percentage).toBe(125);
    expect(entStatus?.isOverspent).toBe(true);

    const grocStatus = statuses.find((s) => s.budget.categoryId === "groceries");
    expect(grocStatus).toBeDefined();
    expect(grocStatus?.spentMinor).toBe(30000);
    expect(grocStatus?.remainingMinor).toBe(20000);
    expect(grocStatus?.percentage).toBe(60);
    expect(grocStatus?.isOverspent).toBe(false);
  });
});
