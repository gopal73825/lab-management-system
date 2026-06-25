"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Package } from "lucide-react";
import { assetService } from "@/services/assetService";
import type { Asset, AssetCategory, AssetStatus } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES: AssetCategory[] = [
  "Mouse","Keyboard","Monitor","Motherboard","Processor","RAM","SSD","HDD",
  "NVMe","SMPS","Projector","Printer","Scanner","UPS","Biometric Device","Switch","Router"
];
const STATUSES: AssetStatus[] = ["Available","Assigned","Working","Faulty","Under Repair","Disposed"];
const PER_PAGE = 10;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    assetService.getAll().then(setAssets).finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.assetId.toLowerCase().includes(q) || a.assetName.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q);
    const matchCat = !categoryFilter || a.category === categoryFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await assetService.delete(deleteTarget.id);
      setAssets((p) => p.filter((a) => a.id !== deleteTarget.id));
      toast.success("Asset deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Manage individual hardware assets"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assets" }]}
        actions={<Link href="/assets/add" className="btn-primary"><Plus className="w-4 h-4" /> Add Asset</Link>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by Asset ID, name, brand…" className="flex-1 min-w-[200px]" />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No assets found"
            action={!search && !categoryFilter && !statusFilter && <Link href="/assets/add" className="btn-primary">Add Asset</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Asset ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Brand</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Purchase</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono text-xs text-primary-600 dark:text-primary-400 font-medium">{asset.assetId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{asset.assetName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{asset.category}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{asset.brand}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell text-xs">{asset.assignedLocation || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{formatDate(asset.purchaseDate)}</td>
                      <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/assets/${asset.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/assets/edit/${asset.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteTarget(asset)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete asset "${deleteTarget?.assetName}" (${deleteTarget?.assetId})?`} />
    </div>
  );
}
