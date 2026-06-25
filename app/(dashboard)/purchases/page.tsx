"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { purchaseService } from "@/services/purchaseService";
import { vendorService } from "@/services/vendorService";
import type { Purchase } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const PER_PAGE = 10;

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [vendors, setVendors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([purchaseService.getAll(), vendorService.getAll()]).then(([p, v]) => {
      setPurchases(p);
      const map: Record<string, string> = {};
      v.forEach((vendor) => { if (vendor.id) map[vendor.id] = vendor.vendorName; });
      setVendors(map);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = purchases.filter((p) => {
    const q = search.toLowerCase();
    return !search || p.purchaseNumber.toLowerCase().includes(q) || (vendors[p.vendorId] || "").toLowerCase().includes(q);
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await purchaseService.delete(deleteTarget.id);
      setPurchases((p) => p.filter((x) => x.id !== deleteTarget.id));
      toast.success("Purchase deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Purchases"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Purchases" }]}
        actions={<Link href="/purchases/add" className="btn-primary"><Plus className="w-4 h-4" /> Add Purchase</Link>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by purchase no., vendor…" className="max-w-sm" />
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-6 h-6" />} title="No purchases found"
            action={!search && <Link href="/purchases/add" className="btn-primary">Add Purchase</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Purchase No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Vendor</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{purchase.purchaseNumber}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{vendors[purchase.vendorId] || purchase.vendorId}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{formatDate(purchase.purchaseDate)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">₹{purchase.totalAmount?.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{purchase.items?.length || 0} item(s)</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setDeleteTarget(purchase)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete purchase "${deleteTarget?.purchaseNumber}"?`} />
    </div>
  );
}
