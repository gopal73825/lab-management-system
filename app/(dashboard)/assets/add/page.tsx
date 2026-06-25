"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { assetService } from "@/services/assetService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import type { AssetCategory, AssetStatus } from "@/types";
import toast from "react-hot-toast";

const CATEGORIES: AssetCategory[] = [
  "Mouse","Keyboard","Monitor","Motherboard","Processor","RAM","SSD","HDD",
  "NVMe","SMPS","Projector","Printer","Scanner","UPS","Biometric Device","Switch","Router"
];
const STATUSES: AssetStatus[] = ["Available","Assigned","Working","Faulty","Under Repair","Disposed"];

export default function AddAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    assetId: "", assetName: "", category: "" as AssetCategory, brand: "", model: "",
    serialNumber: "", purchaseDate: "", warrantyExpiry: "", assignedTo: "",
    assignedLocation: "", status: "Available" as AssetStatus, imageUrl: "", remarks: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetId.trim()) { toast.error("Asset ID is required"); return; }
    setLoading(true);
    try {
      await assetService.create(form as never);
      toast.success("Asset created!");
      router.push("/assets");
    } catch { toast.error("Failed to create asset"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Asset"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Add" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> Asset IDs are manually entered (e.g., MOU001, KEY001, MON001). Do not auto-generate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Asset ID" required>
              <Input value={form.assetId} onChange={(e) => set("assetId", e.target.value)} placeholder="MOU001" required className="font-mono" />
            </FormField>
            <FormField label="Asset Name" required>
              <Input value={form.assetName} onChange={(e) => set("assetName", e.target.value)} placeholder="Logitech Mouse" required />
            </FormField>
            <FormField label="Category" required>
              <Select value={form.category} onChange={(e) => set("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} required />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </FormField>
            <FormField label="Brand">
              <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Logitech" />
            </FormField>
            <FormField label="Model">
              <Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="M100" />
            </FormField>
            <FormField label="Serial Number">
              <Input value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} placeholder="SN123456" />
            </FormField>
            <FormField label="Purchase Date">
              <Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} />
            </FormField>
            <FormField label="Warranty Expiry">
              <Input type="date" value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry", e.target.value)} />
            </FormField>
            <FormField label="Assigned To">
              <Input value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} placeholder="Staff / System / Lab" />
            </FormField>
            <FormField label="Assigned Location">
              <Input value={form.assignedLocation} onChange={(e) => set("assignedLocation", e.target.value)} placeholder="Lab 1 / Block A" />
            </FormField>
          </div>
          <FormField label="Image URL">
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} type="url" />
          </FormField>
          <FormField label="Remarks">
            <Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Create Asset"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
