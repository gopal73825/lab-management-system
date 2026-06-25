import { orderBy } from "firebase/firestore";
import { AssetAssignment } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "assetAssignments";

export const assignmentService = {
  getAll: () => getCollection<AssetAssignment>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<AssetAssignment>(COL, id),
  getByAsset: (assetId: string) =>
    getCollection<AssetAssignment>(COL).then((a) =>
      a.filter((x) => x.assetId === assetId)
    ),
  create: (data: Omit<AssetAssignment, "id" | "createdAt">) =>
    addDocument(COL, data),
  update: (id: string, data: Partial<AssetAssignment>) =>
    updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
};
