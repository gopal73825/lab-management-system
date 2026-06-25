import { UserProfile } from "@/types";
import {
  getDocument,
  setDocument,
  updateDocument,
} from "@/lib/firebase/firestore";

const COL = "users";

export const userService = {
  getById: (uid: string) => getDocument<UserProfile>(COL, uid),
  create: (data: UserProfile) => setDocument(COL, data.uid, data),
  update: (uid: string, data: Partial<UserProfile>) =>
    updateDocument(COL, uid, data),
};
