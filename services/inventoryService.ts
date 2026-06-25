import { InventoryItem } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  serverTimestamp,
} from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";

const COL = "inventory";

export const inventoryService = {
  getAll: () => getCollection<InventoryItem>(COL, [orderBy("updatedAt", "desc")]),
  getById: (id: string) => getDocument<InventoryItem>(COL, id),
  create: (data: Omit<InventoryItem, "id" | "updatedAt">) =>
    addDocument(COL, { ...data, updatedAt: serverTimestamp() }),
  update: (id: string, data: Partial<InventoryItem>) =>
    updateDocument(COL, id, { ...data, updatedAt: serverTimestamp() }),
  delete: (id: string) => deleteDocument(COL, id),
  getLowStock: async () => {
    const items = await getCollection<InventoryItem>(COL);
    return items.filter((i) => i.quantity <= i.minimumStock);
  },
};
