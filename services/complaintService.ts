import { orderBy } from "firebase/firestore";
import { Complaint } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "complaints";

export const complaintService = {
  getAll: () => getCollection<Complaint>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<Complaint>(COL, id),
  create: (data: Omit<Complaint, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<Complaint>) =>
    updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
  getOpen: async () => {
    const all = await getCollection<Complaint>(COL);
    return all.filter((c) => !["Resolved", "Closed"].includes(c.status));
  },
};
