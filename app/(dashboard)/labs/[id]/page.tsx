"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Cpu } from "lucide-react";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Lab, System } from "@/types";

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lab, setLab] = useState<Lab | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([labService.getById(id), systemService.getByLab(id)])
      .then(([l, s]) => { setLab(l); setSystems(s); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!lab?.id) return;
    setDeleting(true);
    try {
      await labService.delete(lab.id);
      toast.success("Lab deleted");
      router.push("/labs");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;
  if (!lab) return <p className="text-gray-500">Lab not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={lab.labName}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Labs", href: "/labs" }, { label: lab.labName }]}
        actions={
          <div className="flex gap-2">
            <Link href={`/labs/edit/${id}`} className="btn-secondary"><Pencil className="w-4 h-4" /> Edit</Link>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {lab.imageUrl && (
            <div className="card overflow-hidden">
              <div className="relative h-48 w-full">
                <Image src={lab.imageUrl} alt={lab.labName} fill className="object-cover" />
              </div>
            </div>
          )}
          <div className="card p-6">
            <h2 className="section-title mb-4">Lab Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Lab ID", lab.labId], ["Lab Code", lab.labCode],
                ["Building", lab.building], ["Floor", lab.floor],
                ["Capacity", lab.capacity], ["Created", formatDate(lab.createdAt)],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="text-sm text-gray-900 dark:text-white mt-0.5">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            {lab.description && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</dt>
                <dd className="text-sm text-gray-700 dark:text-gray-300">{lab.description}</dd>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Systems ({systems.length})</h2>
            <Link href={`/systems/add?labId=${id}`} className="text-xs text-primary-600 hover:text-primary-700">+ Add</Link>
          </div>
          {systems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No systems in this lab</p>
          ) : (
            <div className="space-y-2">
              {systems.map((s) => (
                <Link key={s.id} href={`/systems/${s.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.systemNumber}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting} message={`Delete "${lab.labName}"?`} />
    </div>
  );
}
