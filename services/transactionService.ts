import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { TransactionType } from "@/types";

export type TransactionInput = Omit<
  TransactionType,
  "id" | "createdAt" | "updatedAt"
>;

const transactionsCollection = (uid: string) =>
  collection(firestore, "users", uid, "transactions");

const toTransaction = (
  id: string,
  data: Omit<TransactionType, "id">,
): TransactionType => ({
  ...data,
  id,
});

export async function createTransaction(
  uid: string,
  transaction: TransactionInput,
): Promise<string> {
  const reference = await addDoc(transactionsCollection(uid), {
    ...transaction,
    date:
      transaction.date instanceof Date
        ? Timestamp.fromDate(transaction.date)
        : transaction.date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function listTransactions(
  uid: string,
): Promise<TransactionType[]> {
  const snapshot = await getDocs(
    query(transactionsCollection(uid), orderBy("date", "desc")),
  );

  return snapshot.docs.map((item) =>
    toTransaction(item.id, item.data() as Omit<TransactionType, "id">),
  );
}

export async function updateTransaction(
  uid: string,
  transactionId: string,
  updates: Partial<TransactionInput>,
): Promise<void> {
  const reference = doc(transactionsCollection(uid), transactionId);
  await updateDoc(reference, {
    ...updates,
    ...(updates.date instanceof Date
      ? { date: Timestamp.fromDate(updates.date) }
      : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(
  uid: string,
  transactionId: string,
): Promise<void> {
  await deleteDoc(doc(transactionsCollection(uid), transactionId));
}
