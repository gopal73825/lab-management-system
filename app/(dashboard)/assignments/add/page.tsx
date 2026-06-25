"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { assignmentService } from "@/services/assignmentService";
import { assetService } from "@/services/assetService";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import type { Asset, Lab, System, AssignedToType } from "@/types";
import toast from "react-hot-toast";

const typeOptions = (["System", "Lab", "Staff"] as AssignedToType[]).map((t) => ({ value: t, label: t }));

export default function AddAssignmentPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ assetId: "", assignedToType: "System" as AssignedToType, assignedToId: "", assignedDate: new Date().toISOString().split("T")[0], returnedDate: "", remarks: "" });

  useEffect(() => {
    Promise.all([assetService.getAll(), labService.getAll(), systemService.getAll()])
      .then(([a, l, s]) => { setAssets(a); setLabs(l); setSystems(s); });
  }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const getTargetOptions = () => {
    if (form.assignedToType === "Lab") return labs.map((l) => ({ value: l.id || "", label: l.labName }));
    if (form.assignedToType === "System") return systems.map((s) => ({ value: s.id || "", label: s.systemNumber }));
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentService.create(form);
      toast.success("Assignment created!");
      router.push("/assignments");
    } catch { toast.error("Failed to create assignment"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Assign Asset"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assignments", href: "/assignments" }, { label: "Assign" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Asset ID" required>
            <Select value={form.assetId} onChange={(e) => set("assetId", e.target.value)} options={assets.map((a) => ({ value: a.assetId, label: `${a.assetId} — ${a.assetName}` }))} required />
          </FormField>
          <FormField label="Assign To Type" required>
            <Select value={form.assignedToType} onChange={(e) => { set("assignedToType", e.target.value); set("assignedToId", ""); }} options={typeOptions} required />
          </FormField>
          <FormField label="Assigned To" required>
            {form.assignedToType === "Staff" ? (
              <Input value={form.assignedToId} onChange={(e) => set("assignedToId", e.target.value)} placeholder="Staff name / ID" required />
            ) : (
              <Select value={form.assignedToId} onChange={(e) => set("assignedToId", e.target.value)} options={getTargetOptions()} required />
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assigned Date" required>
              <Input type="date" value={form.assignedDate} onChange={(e) => set("assignedDate", e.target.value)} required />
            </FormField>
            <FormField label="Return Date">
              <Input type="date" value={form.returnedDate} onChange={(e) => set("returnedDate", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Remarks"><Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} /></FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Saving…" : "Create Assignment"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
