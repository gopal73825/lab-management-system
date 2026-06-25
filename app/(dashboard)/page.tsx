"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical, Cpu, Package, Archive, CheckCircle2,
  XCircle, AlertCircle, Clock, Plus, ArrowRight,
} from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/Badge";
import { TableSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { assetService } from "@/services/assetService";
import { inventoryService } from "@/services/inventoryService";
import { complaintService } from "@/services/complaintService";
import { assignmentService } from "@/services/assignmentService";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Complaint, AssetAssignment } from "@/types";

interface DashboardStats {
  totalLabs: number;
  totalSystems: number;
  totalAssets: number;
  totalInventory: number;
  workingAssets: number;
  faultyAssets: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [labs, systems, assets, inventory, complaints, assignments] = await Promise.all([
          labService.getAll(),
          systemService.getAll(),
          assetService.getAll(),
          inventoryService.getAll(),
          complaintService.getAll(),
          assignmentService.getAll(),
        ]);

        setStats({
          totalLabs: labs.length,
          totalSystems: systems.length,
          totalAssets: assets.length,
          totalInventory: inventory.length,
          workingAssets: assets.filter((a) => a.status === "Working" || a.status === "Available").length,
          faultyAssets: assets.filter((a) => a.status === "Faulty").length,
          openComplaints: complaints.filter((c) => !["Resolved", "Closed"].includes(c.status)).length,
          resolvedComplaints: complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
        });

        setRecentComplaints(complaints.slice(0, 5));
        setRecentAssignments(assignments.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${profile?.fullName?.split(" ")[0] ?? "User"} 👋`}
        description="Here's what's happening in your labs today."
      />

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Labs" value={stats?.totalLabs ?? 0} icon={<FlaskConical className="w-5 h-5" />} color="blue" />
          <StatsCard title="Total Systems" value={stats?.totalSystems ?? 0} icon={<Cpu className="w-5 h-5" />} color="indigo" />
          <StatsCard title="Total Assets" value={stats?.totalAssets ?? 0} icon={<Package className="w-5 h-5" />} color="purple" />
          <StatsCard title="Inventory Items" value={stats?.totalInventory ?? 0} icon={<Archive className="w-5 h-5" />} color="orange" />
          <StatsCard title="Working Assets" value={stats?.workingAssets ?? 0} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
          <StatsCard title="Faulty Assets" value={stats?.faultyAssets ?? 0} icon={<XCircle className="w-5 h-5" />} color="red" />
          <StatsCard title="Open Complaints" value={stats?.openComplaints ?? 0} icon={<AlertCircle className="w-5 h-5" />} color="yellow" />
          <StatsCard title="Resolved" value={stats?.resolvedComplaints ?? 0} icon={<Clock className="w-5 h-5" />} color="green" />
        </div>
      )}

      {/* Quick Nav */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { href: "/labs/add", label: "Add Lab", icon: <FlaskConical className="w-5 h-5" />, color: "text-blue-500" },
            { href: "/systems/add", label: "Add System", icon: <Cpu className="w-5 h-5" />, color: "text-indigo-500" },
            { href: "/assets/add", label: "Add Asset", icon: <Package className="w-5 h-5" />, color: "text-purple-500" },
            { href: "/inventory/add", label: "Add Stock", icon: <Archive className="w-5 h-5" />, color: "text-orange-500" },
            { href: "/complaints/add", label: "New Complaint", icon: <AlertCircle className="w-5 h-5" />, color: "text-red-500" },
            { href: "/assignments/add", label: "Assign Asset", icon: <Plus className="w-5 h-5" />, color: "text-green-500" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800"
            >
              <div className={item.color}>{item.icon}</div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Complaints</h2>
            <Link href="/complaints" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : recentComplaints.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No complaints yet</p>
          ) : (
            <div className="space-y-2">
              {recentComplaints.map((c) => (
                <Link
                  key={c.id}
                  href={`/complaints/${c.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.complaintNo}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{c.problemDescription}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={c.status} />
                    <p className="text-xs text-gray-400 mt-1">{formatDate(c.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assignments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Assignments</h2>
            <Link href="/assignments" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : recentAssignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No assignments yet</p>
          ) : (
            <div className="space-y-2">
              {recentAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.assetId}</p>
                    <p className="text-xs text-gray-500">→ {a.assignedToType}: {a.assignedToId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(a.assignedDate)}</p>
                    {a.returnedDate ? (
                      <span className="text-xs text-green-600">Returned</span>
                    ) : (
                      <span className="text-xs text-blue-600">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
