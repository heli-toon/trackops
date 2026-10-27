import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { UserPreferencesType } from "@/types";

export type UserPreferencesInput = Omit<UserPreferencesType, "updatedAt">;

const preferencesDocument = (uid: string) =>
  doc(firestore, "users", uid, "preferences", "settings");

export async function getUserPreferences(
  uid: string,
): Promise<UserPreferencesType | null> {
  const snapshot = await getDoc(preferencesDocument(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserPreferencesType;
}

export async function saveUserPreferences(
  uid: string,
  preferences: UserPreferencesInput,
): Promise<void> {
  await setDoc(
    preferencesDocument(uid),
    {
      ...preferences,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
