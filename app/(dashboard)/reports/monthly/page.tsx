"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { reportService } from "@/services/reportService";
import type { DailyReport } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function MonthlyReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.getByMonth(year, month).then(setReports).finally(() => setLoading(false));
  }, [year, month]);

  return (
    <div>
      <PageHeader
        title="Monthly Reports"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Monthly" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/reports/daily" className="btn-secondary text-xs">Daily</Link>
            <Link href="/reports/yearly" className="btn-secondary text-xs">Yearly</Link>
          </div>
        }
      />
      <div className="card p-5 mb-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field w-40">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field w-28">
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{MONTHS[month - 1]} {year} — {reports.length} report{reports.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="card overflow-hidden">
        {loading ? <div className="p-4"><TableSkeleton /></div> :
         reports.length === 0 ? (
          <EmptyState icon={<FileText className="w-6 h-6" />} title="No reports for this month" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Technician</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Work Done</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.reportDate)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.technician}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{r.location}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell truncate max-w-[250px]">{r.workDone}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
