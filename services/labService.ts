import { orderBy } from "firebase/firestore";
import { Lab } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  serverTimestamp,
} from "@/lib/firebase/firestore";

const COL = "labs";

export const labService = {
  getAll: () => getCollection<Lab>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<Lab>(COL, id),
  create: (data: Omit<Lab, "id" | "createdAt">) =>
    addDocument(COL, data),
  update: (id: string, data: Partial<Lab>) =>
    updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
