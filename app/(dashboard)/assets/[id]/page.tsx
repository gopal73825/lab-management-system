"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, History } from "lucide-react";
import { assetService } from "@/services/assetService";
import { assignmentService } from "@/services/assignmentService";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Asset, AssetAssignment } from "@/types";

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    assetService.getById(id).then(async (a) => {
      setAsset(a);
      if (a?.assetId) {
        const h = await assignmentService.getByAsset(a.assetId);
        setHistory(h);
      }
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!asset?.id) return;
    setDeleting(true);
    try {
      await assetService.delete(asset.id);
      toast.success("Asset deleted");
      router.push("/assets");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!asset) return <p className="text-gray-500">Asset not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.assetName}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Assets", href: "/assets" }, { label: asset.assetId }]}
        actions={
          <div className="flex gap-2">
            <Link href={`/assets/edit/${id}`} className="btn-secondary"><Pencil className="w-4 h-4" /> Edit</Link>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {asset.imageUrl && (
            <div className="card overflow-hidden">
              <div className="relative h-48 w-full">
                <Image src={asset.imageUrl} alt={asset.assetName} fill className="object-contain p-4" />
              </div>
            </div>
          )}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">{asset.assetId}</span>
              <StatusBadge status={asset.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Category", asset.category], ["Brand", asset.brand], ["Model", asset.model],
                ["Serial Number", asset.serialNumber], ["Purchase Date", formatDate(asset.purchaseDate)],
                ["Warranty Expiry", formatDate(asset.warrantyExpiry)],
                ["Assigned To", asset.assignedTo], ["Location", asset.assignedLocation],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="text-sm text-gray-900 dark:text-white mt-0.5">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            {asset.remarks && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Remarks</dt>
                <dd className="text-sm text-gray-700 dark:text-gray-300">{asset.remarks}</dd>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-gray-400" />
            <h2 className="section-title">Assignment History</h2>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No assignment history</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{h.assignedToType}: {h.assignedToId}</p>
                  <p className="text-xs text-gray-500 mt-1">From: {formatDate(h.assignedDate)}</p>
                  {h.returnedDate && <p className="text-xs text-gray-500">To: {formatDate(h.returnedDate)}</p>}
                  {!h.returnedDate && <span className="text-xs text-blue-600">Active</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting} message={`Delete asset "${asset.assetName}"?`} />
    </div>
  );
}
