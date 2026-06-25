"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { complaintService } from "@/services/complaintService";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import type { Lab, System, ComplaintStatus } from "@/types";
import toast from "react-hot-toast";

const statusOptions = (["Open","Assigned","In Progress","Pending Parts","Resolved","Closed"] as ComplaintStatus[]).map((s) => ({ value: s, label: s }));
const issueTypes = ["Hardware Failure","Software Issue","Network Problem","Power Issue","Peripheral Issue","Other"].map((t) => ({ value: t, label: t }));

export default function AddComplaintPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    complaintNo: `CMP${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    labId: "", systemId: "", assetId: "", reportedBy: "", hodName: "",
    issueType: "", problemDescription: "", technicianRemarks: "",
    status: "Open" as ComplaintStatus, closedDate: "",
  });

  useEffect(() => {
    Promise.all([labService.getAll(), systemService.getAll()]).then(([l, s]) => { setLabs(l); setSystems(s); });
  }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const filteredSystems = form.labId ? systems.filter((s) => s.labId === form.labId) : systems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await complaintService.create(form as never);
      toast.success("Complaint filed!");
      router.push("/complaints");
    } catch { toast.error("Failed to file complaint"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New Complaint"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Complaints", href: "/complaints" }, { label: "New" }]}
      />
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Complaint No." required>
              <Input value={form.complaintNo} onChange={(e) => set("complaintNo", e.target.value)} required />
            </FormField>
            <FormField label="Date" required>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
            </FormField>
            <FormField label="Lab">
              <Select value={form.labId} onChange={(e) => { set("labId", e.target.value); set("systemId", ""); }} options={labs.map((l) => ({ value: l.id || "", label: l.labName }))} />
            </FormField>
            <FormField label="System">
              <Select value={form.systemId} onChange={(e) => set("systemId", e.target.value)} options={filteredSystems.map((s) => ({ value: s.id || "", label: s.systemNumber }))} />
            </FormField>
            <FormField label="Asset ID">
              <Input value={form.assetId} onChange={(e) => set("assetId", e.target.value)} placeholder="Asset ID (if applicable)" />
            </FormField>
            <FormField label="Issue Type" required>
              <Select value={form.issueType} onChange={(e) => set("issueType", e.target.value)} options={issueTypes} required />
            </FormField>
            <FormField label="Reported By" required>
              <Input value={form.reportedBy} onChange={(e) => set("reportedBy", e.target.value)} placeholder="Name" required />
            </FormField>
            <FormField label="HOD Name">
              <Input value={form.hodName} onChange={(e) => set("hodName", e.target.value)} placeholder="HOD Name" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={statusOptions} />
            </FormField>
            <FormField label="Closed Date">
              <Input type="date" value={form.closedDate} onChange={(e) => set("closedDate", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Problem Description" required>
            <Textarea value={form.problemDescription} onChange={(e) => set("problemDescription", e.target.value)} rows={3} required />
          </FormField>
          <FormField label="Technician Remarks">
            <Textarea value={form.technicianRemarks} onChange={(e) => set("technicianRemarks", e.target.value)} rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Filing…" : "File Complaint"}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
