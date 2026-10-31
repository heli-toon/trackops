import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { BudgetType, TransactionType } from "@/types";

export type BudgetInput = Pick<
  BudgetType,
  "month" | "categoryId" | "amountMinor"
>;

export type BudgetStatus = {
  budget: BudgetType;
  spentMinor: number;
  remainingMinor: number;
  percentage: number;
  isOverspent: boolean;
};

const budgetsCollection = (uid: string) =>
  collection(firestore, "users", uid, "budgets");

export async function createBudget(
  uid: string,
  budget: BudgetInput,
): Promise<string> {
  const reference = await addDoc(budgetsCollection(uid), {
    ...budget,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function listBudgets(uid: string): Promise<BudgetType[]> {
  const snapshot = await getDocs(
    query(budgetsCollection(uid), orderBy("month", "desc")),
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<BudgetType, "id">),
    id: item.id,
  }));
}

export async function updateBudget(
  uid: string,
  budgetId: string,
  updates: Partial<BudgetInput>,
): Promise<void> {
  await updateDoc(doc(budgetsCollection(uid), budgetId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBudget(
  uid: string,
  budgetId: string,
): Promise<void> {
  await deleteDoc(doc(budgetsCollection(uid), budgetId));
}

export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function calculateBudgetStatuses(
  budgets: BudgetType[],
  transactions: TransactionType[],
  month: string,
): BudgetStatus[] {
  const spentByCategory = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (
      transaction.type !== "expense" ||
      !transaction.categoryId ||
      getMonthKey(
        transaction.date instanceof Date
          ? transaction.date
          : transaction.date.toDate(),
      ) !== month
    ) {
      return;
    }

    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? 0) +
        transaction.amountMinor,
    );
  });

  return budgets
    .filter((budget) => budget.month === month)
    .map((budget) => {
      const spentMinor = spentByCategory.get(budget.categoryId) ?? 0;
      const percentage =
        budget.amountMinor > 0 ? (spentMinor / budget.amountMinor) * 100 : 0;

      return {
        budget,
        spentMinor,
        remainingMinor: budget.amountMinor - spentMinor,
        percentage,
        isOverspent: spentMinor > budget.amountMinor,
      };
    })
    .sort((a, b) => a.budget.categoryId.localeCompare(b.budget.categoryId));
}
