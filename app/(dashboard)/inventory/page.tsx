"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, AlertTriangle, Archive } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types";
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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    inventoryService.getAll().then(setItems).finally(() => setLoading(false));
  }, []);

  const lowStockCount = items.filter((i) => i.quantity <= i.minimumStock).length;

  const filtered = items.filter((item) => {
    const matchSearch = !search || item.itemName.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchLow = !showLowStock || item.quantity <= item.minimumStock;
    return matchSearch && matchLow;
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await inventoryService.delete(deleteTarget.id);
      setItems((p) => p.filter((i) => i.id !== deleteTarget.id));
      toast.success("Item deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track consumable stock items"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inventory" }]}
        actions={<Link href="/inventory/add" className="btn-primary"><Plus className="w-4 h-4" /> Add Item</Link>}
      />

      {lowStockCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>{lowStockCount} item{lowStockCount > 1 ? "s" : ""}</strong> {lowStockCount > 1 ? "are" : "is"} at or below minimum stock level.
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search items…" className="flex-1 min-w-[200px]" />
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showLowStock} onChange={(e) => { setShowLowStock(e.target.checked); setPage(1); }} className="rounded" />
            Low stock only
          </label>
        </div>

        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<Archive className="w-6 h-6" />} title="No items found"
            action={!search && <Link href="/inventory/add" className="btn-primary">Add Item</Link>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Item Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Min. Stock</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Stock Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Updated</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((item) => {
                    const isLow = item.quantity <= item.minimumStock;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.itemName}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{item.category}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.minimumStock}</td>
                        <td className="px-4 py-3">
                          <Badge variant={isLow ? "red" : "green"}>{isLow ? "Low Stock" : "OK"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{formatDate(item.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/inventory/edit/${item.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                            <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete "${deleteTarget?.itemName}" from inventory?`} />
    </div>
  );
}
