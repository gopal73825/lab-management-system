import { orderBy } from "firebase/firestore";
import { Asset } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "assets";

export const assetService = {
  getAll: () => getCollection<Asset>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<Asset>(COL, id),
  create: (data: Omit<Asset, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<Asset>) => updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
