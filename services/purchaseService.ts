import { orderBy } from "firebase/firestore";
import { Purchase } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "purchases";

export const purchaseService = {
  getAll: () => getCollection<Purchase>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<Purchase>(COL, id),
  create: (data: Omit<Purchase, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<Purchase>) =>
    updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
