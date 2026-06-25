"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { systemService } from "@/services/systemService";
import { labService } from "@/services/labService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import type { Lab } from "@/types";
import toast from "react-hot-toast";

const statusOptions = ["Working", "Faulty", "Under Maintenance"].map((s) => ({ value: s, label: s }));

function AddSystemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    systemId: "", systemNumber: "", labId: searchParams.get("labId") || "",
    cpu: "", ram: "", storage: "", monitorAssetId: "", keyboardAssetId: "",
    mouseAssetId: "", status: "Working", remarks: "", imageUrl: "",
  });

  useEffect(() => { labService.getAll().then(setLabs); }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await systemService.create(form as never);
      toast.success("System created!");
      router.push("/systems");
    } catch { toast.error("Failed to create system"); }
    finally { setLoading(false); }
  };

  const labOptions = labs.map((l) => ({ value: l.id || "", label: l.labName }));

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add System"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Systems", href: "/systems" }, { label: "Add" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="System ID" required>
              <Input value={form.systemId} onChange={(e) => set("systemId", e.target.value)} placeholder="SYS001" required />
            </FormField>
            <FormField label="System Number" required>
              <Input value={form.systemNumber} onChange={(e) => set("systemNumber", e.target.value)} placeholder="PC-01" required />
            </FormField>
            <FormField label="Lab" required>
              <Select value={form.labId} onChange={(e) => set("labId", e.target.value)} options={labOptions} required />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={statusOptions} />
            </FormField>
            <FormField label="CPU">
              <Input value={form.cpu} onChange={(e) => set("cpu", e.target.value)} placeholder="Intel Core i5-12400" />
            </FormField>
            <FormField label="RAM">
              <Input value={form.ram} onChange={(e) => set("ram", e.target.value)} placeholder="8GB DDR4" />
            </FormField>
            <FormField label="Storage">
              <Input value={form.storage} onChange={(e) => set("storage", e.target.value)} placeholder="512GB SSD" />
            </FormField>
            <FormField label="Monitor Asset ID">
              <Input value={form.monitorAssetId} onChange={(e) => set("monitorAssetId", e.target.value)} placeholder="MON001" />
            </FormField>
            <FormField label="Keyboard Asset ID">
              <Input value={form.keyboardAssetId} onChange={(e) => set("keyboardAssetId", e.target.value)} placeholder="KEY001" />
            </FormField>
            <FormField label="Mouse Asset ID">
              <Input value={form.mouseAssetId} onChange={(e) => set("mouseAssetId", e.target.value)} placeholder="MOU001" />
            </FormField>
          </div>
          <FormField label="Image URL">
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} type="url" />
          </FormField>
          <FormField label="Remarks">
            <Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Create System"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddSystemPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading…</div>}>
      <AddSystemForm />
    </Suspense>
  );
}
