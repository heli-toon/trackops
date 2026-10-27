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
import { BudgetType } from "@/types";

export type BudgetInput = Pick<
  BudgetType,
  "month" | "categoryId" | "amountMinor"
>;

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
