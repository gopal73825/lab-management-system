"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, CheckCircle } from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { FormField, Select, Textarea } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Complaint, ComplaintStatus, Lab, System } from "@/types";

const STATUSES: ComplaintStatus[] = ["Open","Assigned","In Progress","Pending Parts","Resolved","Closed"];

const TIMELINE_COLORS: Record<ComplaintStatus, string> = {
  Open: "bg-yellow-500",
  Assigned: "bg-blue-500",
  "In Progress": "bg-indigo-500",
  "Pending Parts": "bg-purple-500",
  Resolved: "bg-green-500",
  Closed: "bg-gray-400",
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("Open");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    const c = await complaintService.getById(id);
    setComplaint(c);
    if (c?.labId) setLab(await labService.getById(c.labId));
    if (c?.systemId) setSystem(await systemService.getById(c.systemId));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!complaint?.id) return;
    setUpdating(true);
    try {
      const updateData: Partial<Complaint> = { status: newStatus, technicianRemarks: remarks };
      if (newStatus === "Closed" || newStatus === "Resolved") {
        updateData.closedDate = new Date().toISOString().split("T")[0];
      }
      await complaintService.update(complaint.id, updateData);
      toast.success("Status updated!");
      setStatusOpen(false);
      load();
    } catch { toast.error("Update failed"); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!complaint?.id) return;
    await complaintService.delete(complaint.id);
    toast.success("Complaint deleted");
    router.push("/complaints");
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!complaint) return <p className="text-gray-500">Complaint not found</p>;

  const timelineSteps = STATUSES;
  const currentIdx = timelineSteps.indexOf(complaint.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={complaint.complaintNo}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Complaints", href: "/complaints" }, { label: complaint.complaintNo }]}
        actions={
          <div className="flex gap-2">
            <button onClick={() => { setNewStatus(complaint.status); setRemarks(complaint.technicianRemarks || ""); setStatusOpen(true); }} className="btn-secondary"><CheckCircle className="w-4 h-4" /> Update Status</button>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>
        }
      />

      {/* Timeline */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Status Timeline</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {timelineSteps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${idx <= currentIdx ? TIMELINE_COLORS[step] + " text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                <span>{step}</span>
              </div>
              {idx < timelineSteps.length - 1 && <div className={`w-6 h-0.5 ${idx < currentIdx ? "bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="section-title">Complaint Details</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            <span className="text-xs text-gray-500">{formatDate(complaint.date)}</span>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Lab", lab?.labName || complaint.labId || "—"],
              ["System", system?.systemNumber || complaint.systemId || "—"],
              ["Asset", complaint.assetId || "—"],
              ["Issue Type", complaint.issueType],
              ["Reported By", complaint.reportedBy],
              ["HOD Name", complaint.hodName || "—"],
              ["Closed Date", complaint.closedDate ? formatDate(complaint.closedDate) : "—"],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{k}</dt>
                <dd className="text-sm text-gray-900 dark:text-white mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Problem Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.problemDescription}</p>
          </div>
          {complaint.technicianRemarks && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Technician Remarks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.technicianRemarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update Status" size="sm">
        <div className="space-y-4">
          <FormField label="New Status">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
          </FormField>
          <FormField label="Technician Remarks">
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setStatusOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleStatusUpdate} disabled={updating} className="btn-primary">{updating ? "Updating…" : "Update"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} message={`Delete complaint "${complaint.complaintNo}"?`} />
    </div>
  );
}
