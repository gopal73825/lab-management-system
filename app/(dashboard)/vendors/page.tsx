"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Store, ExternalLink } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import type { Vendor } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";

const PER_PAGE = 10;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ vendorName: "", contactPerson: "", phone: "", email: "", address: "", website: "", remarks: "" });
  const [deleting, setDeleting] = useState(false);

  const load = () => vendorService.getAll().then(setVendors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return !search || v.vendorName.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
  });
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ vendorName: "", contactPerson: "", phone: "", email: "", address: "", website: "", remarks: "" }); setEditTarget(null); setAddOpen(true); };
  const openEdit = (v: Vendor) => { setForm({ vendorName: v.vendorName, contactPerson: v.contactPerson, phone: v.phone, email: v.email, address: v.address, website: v.website, remarks: v.remarks }); setEditTarget(v); setAddOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget?.id) { await vendorService.update(editTarget.id, form); toast.success("Vendor updated!"); }
      else { await vendorService.create(form as never); toast.success("Vendor added!"); }
      setAddOpen(false);
      load();
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await vendorService.delete(deleteTarget.id);
      setVendors((p) => p.filter((v) => v.id !== deleteTarget.id));
      toast.success("Vendor deleted");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Vendors" }]}
        actions={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vendor</button>}
      />
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search vendors…" className="max-w-sm" />
        </div>
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         paged.length === 0 ? (
          <EmptyState icon={<Store className="w-6 h-6" />} title="No vendors found"
            action={!search && <button onClick={openAdd} className="btn-primary">Add Vendor</button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Vendor Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Website</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paged.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{vendor.vendorName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{vendor.contactPerson}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{vendor.phone}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{vendor.email}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {vendor.website ? <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs"><ExternalLink className="w-3 h-3" /> {vendor.website}</a> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(vendor)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-yellow-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(vendor)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={editTarget ? "Edit Vendor" : "Add Vendor"}>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vendor Name" required><Input value={form.vendorName} onChange={(e) => set("vendorName", e.target.value)} required /></FormField>
            <FormField label="Contact Person"><Input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></FormField>
            <FormField label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></FormField>
            <FormField label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" /></FormField>
          </div>
          <FormField label="Address"><Textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} /></FormField>
          <FormField label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></FormField>
          <FormField label="Remarks"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={`Delete vendor "${deleteTarget?.vendorName}"?`} />
    </div>
  );
}
