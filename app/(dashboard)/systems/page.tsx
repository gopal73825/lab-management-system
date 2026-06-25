"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Cpu } from "lucide-react";
import { systemService } from "@/services/systemService";
import { labService } from "@/services/labService";
import type { System } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";

const PER_PAGE = 10;

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [labs, setLabs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<System | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([systemService.getAll(), labService.getAll()]).then(([s, l]) => {
      setSystems(s);
      const map: Record<string, string> = {};
      l.forEach((lab) => { if (lab.id) map[lab.id] = lab.labName; });
      setLabs(map);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = systems.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.systemNumber.toLowerCase().includes(q) || s.cpu.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await systemService.delete(deleteTarget.id);
      setSystems((p) => p.filter((s) => s.id !== deleteTarget.id));
      toast.success("System deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Systems"
        description="Manage all computer systems"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Systems" }]}
        actions={<Link href="/systems/add" className="btn-primary"><Plus className="w-4 h-4" /> Add System</Link>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by system number, CPU…" className="flex-1 min-w-[200px]" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            {["Working", "Faulty", "Under Maintenance"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<Cpu className="w-6 h-6" />} title="No systems found"
            action={!search && <Link href="/systems/add" className="btn-primary">Add System</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">System No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Lab</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">CPU</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">RAM</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((sys) => (
                    <tr key={sys.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{sys.systemNumber}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{labs[sys.labId] || sys.labId}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{sys.cpu}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{sys.ram}</td>
                      <td className="px-4 py-3"><StatusBadge status={sys.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/systems/${sys.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/systems/edit/${sys.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteTarget(sys)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete system "${deleteTarget?.systemNumber}"?`} />
    </div>
  );
}
