"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { labService } from "@/services/labService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import type { Lab } from "@/types";

export default function EditLabPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Partial<Lab>>({});

  useEffect(() => {
    labService.getById(id).then((lab) => {
      if (lab) setForm(lab);
      setFetching(false);
    });
  }, [id]);

  const set = (k: keyof Lab, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await labService.update(id, form);
      toast.success("Lab updated!");
      router.push("/labs");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Edit Lab"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Labs", href: "/labs" }, { label: "Edit" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Lab ID" required>
              <Input value={form.labId || ""} onChange={(e) => set("labId", e.target.value)} required />
            </FormField>
            <FormField label="Lab Name" required>
              <Input value={form.labName || ""} onChange={(e) => set("labName", e.target.value)} required />
            </FormField>
            <FormField label="Lab Code" required>
              <Input value={form.labCode || ""} onChange={(e) => set("labCode", e.target.value)} required />
            </FormField>
            <FormField label="Building" required>
              <Input value={form.building || ""} onChange={(e) => set("building", e.target.value)} required />
            </FormField>
            <FormField label="Floor">
              <Input value={form.floor || ""} onChange={(e) => set("floor", e.target.value)} />
            </FormField>
            <FormField label="Capacity">
              <Input type="number" value={form.capacity || ""} onChange={(e) => set("capacity", Number(e.target.value))} min="1" />
            </FormField>
          </div>
          <FormField label="Image URL">
            <Input value={form.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} type="url" />
          </FormField>
          <FormField label="Description">
            <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Save Changes"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
