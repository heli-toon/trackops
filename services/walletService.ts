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
import { WalletType } from "@/types";
import { listTransactions } from "@/services/transactionService";

export type WalletInput = Pick<WalletType, "name" | "openingBalanceMinor">;
export type WalletSummary = WalletType & {
  incomeMinor: number;
  expenseMinor: number;
};

const walletsCollection = (uid: string) =>
  collection(firestore, "users", uid, "wallets");
const transactionsCollection = (uid: string) =>
  collection(firestore, "users", uid, "transactions");

export async function createWallet(
  uid: string,
  wallet: WalletInput,
): Promise<string> {
  const reference = await addDoc(walletsCollection(uid), {
    ...wallet,
    balanceMinor: wallet.openingBalanceMinor,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function listWallets(uid: string): Promise<WalletSummary[]> {
  const [snapshot, transactions] = await Promise.all([
    getDocs(query(walletsCollection(uid), orderBy("createdAt", "desc"))),
    listTransactions(uid),
  ]);

  return snapshot.docs.map((item) => {
    const wallet = item.data() as Omit<WalletType, "id">;
    const walletTransactions = transactions.filter(
      (transaction) => transaction.walletId === item.id,
    );
    const incomeMinor = walletTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountMinor, 0);
    const expenseMinor = walletTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountMinor, 0);

    return {
      ...wallet,
      id: item.id,
      incomeMinor,
      expenseMinor,
      balanceMinor:
        wallet.openingBalanceMinor + incomeMinor - expenseMinor,
    };
  });
}

export async function updateWallet(
  uid: string,
  walletId: string,
  updates: Partial<WalletInput>,
): Promise<void> {
  await updateDoc(doc(walletsCollection(uid), walletId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWallet(
  uid: string,
  walletId: string,
): Promise<void> {
  const transactions = await getDocs(
    query(transactionsCollection(uid)),
  );
  if (transactions.docs.some((transaction) => transaction.data().walletId === walletId)) {
    throw new Error("This wallet cannot be deleted while it has transactions.");
  }
  await deleteDoc(doc(walletsCollection(uid), walletId));
}
