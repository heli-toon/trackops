import { TransactionKind } from "@/types";

export type TransactionFormValues = {
  type: TransactionKind;
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  walletId?: string;
};

export type TransactionFormErrors = Partial<
  Record<keyof TransactionFormValues, string>
>;

export type ValidatedTransaction = {
  type: TransactionKind;
  amountMinor: number;
  categoryId: string;
  description: string;
  date: Date;
  walletId?: string;
};

export function validateTransactionForm(
  values: TransactionFormValues,
): { errors: TransactionFormErrors; data?: ValidatedTransaction } {
  const errors: TransactionFormErrors = {};
  const amount = Number(values.amount.replace(",", "."));
  const date = new Date(`${values.date}T12:00:00`);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  }
  if (!values.categoryId) {
    errors.categoryId = "Choose a category.";
  }
  if (!values.description.trim()) {
    errors.description = "Enter a description.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(date.getTime())) {
    errors.date = "Use a valid date in YYYY-MM-DD format.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    data: {
      type: values.type,
      amountMinor: Math.round(amount * 100),
      categoryId: values.categoryId,
      description: values.description.trim(),
      date,
      ...(values.walletId ? { walletId: values.walletId } : {}),
    },
  };
}
