"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { systemService } from "@/services/systemService";
import { labService } from "@/services/labService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { System, Lab } from "@/types";

export default function SystemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [system, setSystem] = useState<System | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    systemService.getById(id).then(async (s) => {
      setSystem(s);
      if (s?.labId) {
        const l = await labService.getById(s.labId);
        setLab(l);
      }
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!system?.id) return;
    setDeleting(true);
    try {
      await systemService.delete(system.id);
      toast.success("System deleted");
      router.push("/systems");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!system) return <p className="text-gray-500">System not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`System: ${system.systemNumber}`}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Systems", href: "/systems" }, { label: system.systemNumber }]}
        actions={
          <div className="flex gap-2">
            <Link href={`/systems/edit/${id}`} className="btn-secondary"><Pencil className="w-4 h-4" /> Edit</Link>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>
        }
      />
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <StatusBadge status={system.status} />
          {lab && <Link href={`/labs/${system.labId}`} className="text-sm text-primary-600 hover:text-primary-700">{lab.labName}</Link>}
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            ["System ID", system.systemId],
            ["System Number", system.systemNumber],
            ["CPU", system.cpu],
            ["RAM", system.ram],
            ["Storage", system.storage],
            ["Monitor", system.monitorAssetId],
            ["Keyboard", system.keyboardAssetId],
            ["Mouse", system.mouseAssetId],
            ["Created", formatDate(system.createdAt)],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{k}</dt>
              <dd className="text-sm text-gray-900 dark:text-white mt-0.5">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        {system.remarks && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Remarks</dt>
            <dd className="text-sm text-gray-700 dark:text-gray-300">{system.remarks}</dd>
          </div>
        )}
      </div>
      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting} message={`Delete system "${system.systemNumber}"?`} />
    </div>
  );
}
