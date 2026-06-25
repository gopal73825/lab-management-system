"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { assetService } from "@/services/assetService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Asset, AssetCategory, AssetStatus } from "@/types";
import toast from "react-hot-toast";

const CATEGORIES: AssetCategory[] = ["Mouse","Keyboard","Monitor","Motherboard","Processor","RAM","SSD","HDD","NVMe","SMPS","Projector","Printer","Scanner","UPS","Biometric Device","Switch","Router"];
const STATUSES: AssetStatus[] = ["Available","Assigned","Working","Faulty","Under Repair","Disposed"];

export default function EditAssetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Partial<Asset>>({});

  useEffect(() => {
    assetService.getById(id).then((a) => { if (a) setForm(a); setFetching(false); });
  }, [id]);

  const set = (k: keyof Asset, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetService.update(id, form);
      toast.success("Asset updated!");
      router.push("/assets");
    } catch { toast.error("Update failed"); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Asset"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Edit" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Asset ID" required><Input value={form.assetId || ""} onChange={(e) => set("assetId", e.target.value)} required className="font-mono" /></FormField>
            <FormField label="Asset Name" required><Input value={form.assetName || ""} onChange={(e) => set("assetName", e.target.value)} required /></FormField>
            <FormField label="Category" required><Select value={form.category || ""} onChange={(e) => set("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} required /></FormField>
            <FormField label="Status"><Select value={form.status || ""} onChange={(e) => set("status", e.target.value)} options={STATUSES.map((s) => ({ value: s, label: s }))} /></FormField>
            <FormField label="Brand"><Input value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} /></FormField>
            <FormField label="Model"><Input value={form.model || ""} onChange={(e) => set("model", e.target.value)} /></FormField>
            <FormField label="Serial Number"><Input value={form.serialNumber || ""} onChange={(e) => set("serialNumber", e.target.value)} /></FormField>
            <FormField label="Purchase Date"><Input type="date" value={form.purchaseDate || ""} onChange={(e) => set("purchaseDate", e.target.value)} /></FormField>
            <FormField label="Warranty Expiry"><Input type="date" value={form.warrantyExpiry || ""} onChange={(e) => set("warrantyExpiry", e.target.value)} /></FormField>
            <FormField label="Assigned To"><Input value={form.assignedTo || ""} onChange={(e) => set("assignedTo", e.target.value)} /></FormField>
            <FormField label="Assigned Location"><Input value={form.assignedLocation || ""} onChange={(e) => set("assignedLocation", e.target.value)} /></FormField>
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
