import { orderBy } from "firebase/firestore";
import { System } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "systems";

export const systemService = {
  getAll: () => getCollection<System>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<System>(COL, id),
  getByLab: (labId: string) =>
    getCollection<System>(COL, [orderBy("createdAt", "desc")]).then((s) =>
      s.filter((sys) => sys.labId === labId)
    ),
  create: (data: Omit<System, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<System>) => updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
