"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, FileText } from "lucide-react";
import { reportService } from "@/services/reportService";
import type { DailyReport } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { FormField, Input, Textarea, Select } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const PER_PAGE = 10;
const statusOptions = ["Completed","In Progress","Pending"].map((s) => ({ value: s, label: s }));

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ reportDate: new Date().toISOString().split("T")[0], technician: "", location: "", workDone: "", complaintReference: "", status: "Completed", remarks: "" });

  const load = () => reportService.getAll().then(setReports).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return !search || r.technician.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.workDone.toLowerCase().includes(q);
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reportService.create(form as never);
      toast.success("Report added!");
      setAddOpen(false);
      load();
      setForm({ reportDate: new Date().toISOString().split("T")[0], technician: "", location: "", workDone: "", complaintReference: "", status: "Completed", remarks: "" });
    } catch { toast.error("Failed to add report"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await reportService.delete(deleteTarget.id);
      setReports((p) => p.filter((r) => r.id !== deleteTarget.id));
      toast.success("Report deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports", href: "/reports/daily" }, { label: "Daily" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/reports/monthly" className="btn-secondary text-xs">Monthly</Link>
            <Link href="/reports/yearly" className="btn-secondary text-xs">Yearly</Link>
            <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Report</button>
          </div>
        }
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by technician, location…" className="max-w-sm" />
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<FileText className="w-6 h-6" />} title="No reports yet" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Technician</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Work Done</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Complaint Ref.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.reportDate)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.technician}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{r.location}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell truncate max-w-[200px]">{r.workDone}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.complaintReference || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{r.status}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 ml-auto block"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Daily Report">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required><Input type="date" value={form.reportDate} onChange={(e) => set("reportDate", e.target.value)} required /></FormField>
            <FormField label="Status"><Select value={form.status} onChange={(e) => set("status", e.target.value)} options={statusOptions} /></FormField>
          </div>
          <FormField label="Technician" required><Input value={form.technician} onChange={(e) => set("technician", e.target.value)} required /></FormField>
          <FormField label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></FormField>
          <FormField label="Work Done" required><Textarea value={form.workDone} onChange={(e) => set("workDone", e.target.value)} rows={3} required /></FormField>
          <FormField label="Complaint Reference"><Input value={form.complaintReference} onChange={(e) => set("complaintReference", e.target.value)} /></FormField>
          <FormField label="Remarks"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Report"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} message="Delete this report?" />
    </div>
  );
}
