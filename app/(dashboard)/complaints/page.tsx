"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Trash2, AlertCircle } from "lucide-react";
import { complaintService } from "@/services/complaintService";
import type { Complaint, ComplaintStatus } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUSES: ComplaintStatus[] = ["Open","Assigned","In Progress","Pending Parts","Resolved","Closed"];
const PER_PAGE = 10;

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    complaintService.getAll().then(setComplaints).finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.complaintNo.toLowerCase().includes(q) || c.problemDescription.toLowerCase().includes(q) || c.reportedBy.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await complaintService.delete(deleteTarget.id);
      setComplaints((p) => p.filter((c) => c.id !== deleteTarget.id));
      toast.success("Complaint deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Track and manage lab complaints"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Complaints" }]}
        actions={<Link href="/complaints/add" className="btn-primary"><Plus className="w-4 h-4" /> New Complaint</Link>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by complaint no., issue…" className="flex-1 min-w-[200px]" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<AlertCircle className="w-6 h-6" />} title="No complaints found"
            action={!search && <Link href="/complaints/add" className="btn-primary">New Complaint</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Complaint No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Issue Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Reported By</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{c.complaintNo}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{c.problemDescription}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{c.issueType}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{c.reportedBy}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{formatDate(c.date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/complaints/${c.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
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
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete complaint "${deleteTarget?.complaintNo}"?`} />
    </div>
  );
}
