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
import { CategoryType } from "@/types";

export type CategoryInput = Pick<CategoryType, "name" | "color" | "icon">;

const categoriesCollection = (uid: string) =>
  collection(firestore, "users", uid, "categories");

export async function createCategory(
  uid: string,
  category: CategoryInput,
): Promise<string> {
  const reference = await addDoc(categoriesCollection(uid), {
    ...category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function listCategories(uid: string): Promise<CategoryType[]> {
  const snapshot = await getDocs(
    query(categoriesCollection(uid), orderBy("name", "asc")),
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<CategoryType, "id">),
    id: item.id,
  }));
}

export async function updateCategory(
  uid: string,
  categoryId: string,
  updates: Partial<CategoryInput>,
): Promise<void> {
  await updateDoc(doc(categoriesCollection(uid), categoryId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(
  uid: string,
  categoryId: string,
): Promise<void> {
  await deleteDoc(doc(categoriesCollection(uid), categoryId));
}
