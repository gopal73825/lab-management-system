"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeftRight, CheckCircle } from "lucide-react";
import { assignmentService } from "@/services/assignmentService";
import type { AssetAssignment } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const PER_PAGE = 10;

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AssetAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => assignmentService.getAll().then(setAssignments).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return !search || a.assetId.toLowerCase().includes(q) || a.assignedToId.toLowerCase().includes(q) || a.assignedToType.toLowerCase().includes(q);
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleReturn = async (assignment: AssetAssignment) => {
    if (!assignment.id) return;
    try {
      await assignmentService.update(assignment.id, { returnedDate: new Date().toISOString().split("T")[0] });
      toast.success("Asset returned");
      load();
    } catch { toast.error("Failed to return"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await assignmentService.delete(deleteTarget.id);
      setAssignments((p) => p.filter((a) => a.id !== deleteTarget.id));
      toast.success("Assignment deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Asset Assignments"
        description="Track which assets are assigned where"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assignments" }]}
        actions={<Link href="/assignments/add" className="btn-primary"><Plus className="w-4 h-4" /> Assign Asset</Link>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by asset ID, location…" className="max-w-sm" />
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<ArrowLeftRight className="w-6 h-6" />} title="No assignments found"
            action={!search && <Link href="/assignments/add" className="btn-primary">Assign Asset</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Asset ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Assigned To</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Assigned Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Returned</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono text-xs text-primary-600 dark:text-primary-400 font-medium">{a.assetId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.assignedToId}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{a.assignedToType}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{formatDate(a.assignedDate)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{a.returnedDate ? formatDate(a.returnedDate) : "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.returnedDate ? "green" : "blue"}>{a.returnedDate ? "Returned" : "Active"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {!a.returnedDate && (
                            <button onClick={() => handleReturn(a)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-green-600" title="Mark Returned">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete this assignment record?`} />
    </div>
  );
}
