"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { systemService } from "@/services/systemService";
import { labService } from "@/services/labService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import type { System, Lab } from "@/types";
import toast from "react-hot-toast";

const statusOptions = ["Working", "Faulty", "Under Maintenance"].map((s) => ({ value: s, label: s }));

export default function EditSystemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Partial<System>>({});

  useEffect(() => {
    Promise.all([systemService.getById(id), labService.getAll()]).then(([s, l]) => {
      if (s) setForm(s);
      setLabs(l);
      setFetching(false);
    });
  }, [id]);

  const set = (k: keyof System, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await systemService.update(id, form);
      toast.success("System updated!");
      router.push("/systems");
    } catch { toast.error("Update failed"); }
    finally { setLoading(false); }
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const labOptions = labs.map((l) => ({ value: l.id || "", label: l.labName }));

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit System"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Systems", href: "/systems" }, { label: "Edit" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="System ID" required><Input value={form.systemId || ""} onChange={(e) => set("systemId", e.target.value)} required /></FormField>
            <FormField label="System Number" required><Input value={form.systemNumber || ""} onChange={(e) => set("systemNumber", e.target.value)} required /></FormField>
            <FormField label="Lab" required><Select value={form.labId || ""} onChange={(e) => set("labId", e.target.value)} options={labOptions} required /></FormField>
            <FormField label="Status"><Select value={form.status || ""} onChange={(e) => set("status", e.target.value)} options={statusOptions} /></FormField>
            <FormField label="CPU"><Input value={form.cpu || ""} onChange={(e) => set("cpu", e.target.value)} /></FormField>
            <FormField label="RAM"><Input value={form.ram || ""} onChange={(e) => set("ram", e.target.value)} /></FormField>
            <FormField label="Storage"><Input value={form.storage || ""} onChange={(e) => set("storage", e.target.value)} /></FormField>
            <FormField label="Monitor Asset ID"><Input value={form.monitorAssetId || ""} onChange={(e) => set("monitorAssetId", e.target.value)} /></FormField>
            <FormField label="Keyboard Asset ID"><Input value={form.keyboardAssetId || ""} onChange={(e) => set("keyboardAssetId", e.target.value)} /></FormField>
            <FormField label="Mouse Asset ID"><Input value={form.mouseAssetId || ""} onChange={(e) => set("mouseAssetId", e.target.value)} /></FormField>
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
