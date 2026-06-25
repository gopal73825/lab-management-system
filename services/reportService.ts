import { orderBy } from "firebase/firestore";
import { DailyReport } from "@/types";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

const COL = "dailyReports";

export const reportService = {
  getAll: () => getCollection<DailyReport>(COL, [orderBy("createdAt", "desc")]),
  getById: (id: string) => getDocument<DailyReport>(COL, id),
  create: (data: Omit<DailyReport, "id" | "createdAt">) => addDocument(COL, data),
  update: (id: string, data: Partial<DailyReport>) =>
    updateDocument(COL, id, data),
  delete: (id: string) => deleteDocument(COL, id),
  getByMonth: async (year: number, month: number) => {
    const all = await getCollection<DailyReport>(COL);
    return all.filter((r) => {
      const d = new Date(r.reportDate);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  },
  getByYear: async (year: number) => {
    const all = await getCollection<DailyReport>(COL);
    return all.filter((r) => new Date(r.reportDate).getFullYear() === year);
  },
};
