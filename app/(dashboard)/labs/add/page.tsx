"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { labService } from "@/services/labService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function AddLabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    labId: "", labName: "", labCode: "", building: "",
    floor: "", capacity: "", imageUrl: "", description: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await labService.create({
        ...form,
        capacity: Number(form.capacity),
      } as never);
      toast.success("Lab created!");
      router.push("/labs");
    } catch {
      toast.error("Failed to create lab");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Add Lab"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Labs", href: "/labs" }, { label: "Add" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Lab ID" required>
              <Input value={form.labId} onChange={(e) => set("labId", e.target.value)} placeholder="LAB001" required />
            </FormField>
            <FormField label="Lab Name" required>
              <Input value={form.labName} onChange={(e) => set("labName", e.target.value)} placeholder="Computer Lab 1" required />
            </FormField>
            <FormField label="Lab Code" required>
              <Input value={form.labCode} onChange={(e) => set("labCode", e.target.value)} placeholder="CL-01" required />
            </FormField>
            <FormField label="Building" required>
              <Input value={form.building} onChange={(e) => set("building", e.target.value)} placeholder="Block A" required />
            </FormField>
            <FormField label="Floor">
              <Input value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="Ground Floor" />
            </FormField>
            <FormField label="Capacity">
              <Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="30" min="1" />
            </FormField>
          </div>
          <FormField label="Image URL">
            <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" type="url" />
          </FormField>
          <FormField label="Description">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of the lab…" rows={3} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving…" : "Create Lab"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
