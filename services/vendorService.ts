import { orderBy } from "firebase/firestore";
import { Vendor } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "vendors";

export const vendorService = {
  getAll: () => getCollection<Vendor>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<Vendor>(COL, id),
  create: (data: Omit<Vendor, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<Vendor>) => updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
