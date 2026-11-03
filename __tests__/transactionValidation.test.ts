import { validateTransactionForm } from "../utils/transactionValidation";

describe("validateTransactionForm", () => {
  it("validates a correct transaction form", () => {
    const result = validateTransactionForm({
      type: "expense",
      amount: "45.50",
      categoryId: "groceries",
      description: "Supermarket shopping",
      date: "2026-11-03",
      walletId: "wallet_1",
    });

    expect(result.errors).toEqual({});
    expect(result.data).toBeDefined();
    expect(result.data?.amountMinor).toBe(4550);
    expect(result.data?.type).toBe("expense");
    expect(result.data?.categoryId).toBe("groceries");
    expect(result.data?.description).toBe("Supermarket shopping");
    expect(result.data?.walletId).toBe("wallet_1");
  });

  it("handles commas in amount string", () => {
    const result = validateTransactionForm({
      type: "income",
      amount: "1250,75",
      categoryId: "salary",
      description: "Monthly salary",
      date: "2026-11-01",
    });

    expect(result.errors).toEqual({});
    expect(result.data?.amountMinor).toBe(125075);
  });

  it("returns error for invalid or non-positive amount", () => {
    const resultZero = validateTransactionForm({
      type: "expense",
      amount: "0",
      categoryId: "food",
      description: "Lunch",
      date: "2026-11-03",
    });
    expect(resultZero.errors.amount).toBe("Enter an amount greater than zero.");

    const resultNegative = validateTransactionForm({
      type: "expense",
      amount: "-10",
      categoryId: "food",
      description: "Lunch",
      date: "2026-11-03",
    });
    expect(resultNegative.errors.amount).toBe("Enter an amount greater than zero.");

    const resultInvalid = validateTransactionForm({
      type: "expense",
      amount: "abc",
      categoryId: "food",
      description: "Lunch",
      date: "2026-11-03",
    });
    expect(resultInvalid.errors.amount).toBe("Enter an amount greater than zero.");
  });

  it("returns error for missing category", () => {
    const result = validateTransactionForm({
      type: "expense",
      amount: "10",
      categoryId: "",
      description: "Lunch",
      date: "2026-11-03",
    });
    expect(result.errors.categoryId).toBe("Choose a category.");
  });

  it("returns error for empty description", () => {
    const result = validateTransactionForm({
      type: "expense",
      amount: "10",
      categoryId: "food",
      description: "   ",
      date: "2026-11-03",
    });
    expect(result.errors.description).toBe("Enter a description.");
  });

  it("returns error for invalid date format", () => {
    const result = validateTransactionForm({
      type: "expense",
      amount: "10",
      categoryId: "food",
      description: "Lunch",
      date: "invalid-date",
    });
    expect(result.errors.date).toBe("Use a valid date in YYYY-MM-DD format.");
  });
});
