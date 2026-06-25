"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { inventoryService } from "@/services/inventoryService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import type { InventoryItem } from "@/types";
import toast from "react-hot-toast";

export default function EditInventoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    inventoryService.getById(id).then((item) => { if (item) setForm(item); setFetching(false); });
  }, [id]);

  const set = (k: keyof InventoryItem, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryService.update(id, form);
      toast.success("Item updated!");
      router.push("/inventory");
    } catch { toast.error("Update failed"); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Edit Inventory Item"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inventory", href: "/inventory" }, { label: "Edit" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Item Name" required><Input value={form.itemName || ""} onChange={(e) => set("itemName", e.target.value)} required /></FormField>
          <FormField label="Category"><Input value={form.category || ""} onChange={(e) => set("category", e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required><Input type="number" min="0" value={form.quantity ?? ""} onChange={(e) => set("quantity", Number(e.target.value))} required /></FormField>
            <FormField label="Minimum Stock"><Input type="number" min="0" value={form.minimumStock ?? ""} onChange={(e) => set("minimumStock", Number(e.target.value))} /></FormField>
          </div>
          <FormField label="Image URL"><Input value={form.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} type="url" /></FormField>
          <FormField label="Remarks"><Textarea value={form.remarks || ""} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
