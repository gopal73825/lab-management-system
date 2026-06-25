"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { inventoryService } from "@/services/inventoryService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function AddInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ itemName: "", category: "", quantity: "", minimumStock: "", imageUrl: "", remarks: "" });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryService.create({ ...form, quantity: Number(form.quantity), minimumStock: Number(form.minimumStock) } as never);
      toast.success("Item added!");
      router.push("/inventory");
    } catch { toast.error("Failed to add item"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Add Inventory Item"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inventory", href: "/inventory" }, { label: "Add" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Item Name" required><Input value={form.itemName} onChange={(e) => set("itemName", e.target.value)} placeholder="HDMI Cable" required /></FormField>
          <FormField label="Category"><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Cable, Connector, etc." /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required><Input type="number" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required /></FormField>
            <FormField label="Minimum Stock"><Input type="number" min="0" value={form.minimumStock} onChange={(e) => set("minimumStock", e.target.value)} /></FormField>
          </div>
          <FormField label="Image URL"><Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} type="url" /></FormField>
          <FormField label="Remarks"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Add Item"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
