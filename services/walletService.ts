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

export type WalletInput = Pick<WalletType, "name" | "openingBalanceMinor">;

const walletsCollection = (uid: string) =>
  collection(firestore, "users", uid, "wallets");

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

export async function listWallets(uid: string): Promise<WalletType[]> {
  const snapshot = await getDocs(
    query(walletsCollection(uid), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<WalletType, "id">),
    id: item.id,
  }));
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
  await deleteDoc(doc(walletsCollection(uid), walletId));
}
