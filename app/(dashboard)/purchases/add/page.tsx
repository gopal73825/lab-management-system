"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { purchaseService } from "@/services/purchaseService";
import { vendorService } from "@/services/vendorService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import type { Vendor, PurchaseItem } from "@/types";
import toast from "react-hot-toast";

export default function AddPurchasePage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ purchaseNumber: `PO${Date.now().toString().slice(-6)}`, vendorId: "", purchaseDate: new Date().toISOString().split("T")[0], billImageUrl: "", remarks: "" });
  const [items, setItems] = useState<PurchaseItem[]>([{ name: "", quantity: 1, unitPrice: 0, total: 0 }]);

  useEffect(() => { vendorService.getAll().then(setVendors); }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const setItem = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await purchaseService.create({ ...form, totalAmount, items } as never);
      toast.success("Purchase recorded!");
      router.push("/purchases");
    } catch { toast.error("Failed to record purchase"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Add Purchase"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Purchases", href: "/purchases" }, { label: "Add" }]}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card p-6">
          <h2 className="section-title mb-4">Purchase Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Purchase Number" required><Input value={form.purchaseNumber} onChange={(e) => set("purchaseNumber", e.target.value)} required /></FormField>
            <FormField label="Vendor" required><Select value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)} options={vendors.map((v) => ({ value: v.id || "", label: v.vendorName }))} required /></FormField>
            <FormField label="Purchase Date" required><Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} required /></FormField>
            <FormField label="Bill Image URL"><Input value={form.billImageUrl} onChange={(e) => set("billImageUrl", e.target.value)} type="url" /></FormField>
          </div>
          <FormField label="Remarks" className="mt-4"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Items</h2>
            <button type="button" onClick={() => setItems((p) => [...p, { name: "", quantity: 1, unitPrice: 0, total: 0 }])} className="btn-secondary text-xs"><Plus className="w-3.5 h-3.5" /> Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-5">
                  <Input value={item.name} onChange={(e) => setItem(idx, "name", e.target.value)} placeholder="Item name" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => setItem(idx, "quantity", Number(e.target.value))} placeholder="Qty" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input type="number" min="0" value={item.unitPrice} onChange={(e) => setItem(idx, "unitPrice", Number(e.target.value))} placeholder="Unit ₹" />
                </div>
                <div className="col-span-3 sm:col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">₹{item.total.toLocaleString("en-IN")}</div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Total: ₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Record Purchase"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
