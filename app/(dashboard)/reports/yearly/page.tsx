"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { reportService } from "@/services/reportService";
import type { DailyReport } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function YearlyReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.getByYear(year).then(setReports).finally(() => setLoading(false));
  }, [year]);

  const byMonth = MONTHS.map((m, i) => ({
    month: m,
    count: reports.filter((r) => new Date(r.reportDate).getMonth() === i).length,
  }));

  const maxCount = Math.max(...byMonth.map((m) => m.count), 1);

  return (
    <div>
      <PageHeader
        title="Yearly Report Summary"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Yearly" }]}
        actions={
          <div className="flex gap-2">
            <Link href="/reports/daily" className="btn-secondary text-xs">Daily</Link>
            <Link href="/reports/monthly" className="btn-secondary text-xs">Monthly</Link>
          </div>
        }
      />
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field w-28">
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total reports in {year}: <strong className="text-gray-900 dark:text-white">{reports.length}</strong>
          </div>
        </div>
      </div>

      {loading ? <div className="card p-4"><TableSkeleton rows={3} cols={4} /></div> : reports.length === 0 ? (
        <EmptyState icon={<FileText className="w-6 h-6" />} title={`No reports in ${year}`} />
      ) : (
        <div className="card p-6">
          <h2 className="section-title mb-6">Monthly Distribution</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
            {byMonth.map(({ month, count }) => (
              <div key={month} className="flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className="w-8 bg-primary-500 dark:bg-primary-600 rounded-t"
                    style={{ height: `${count > 0 ? (count / maxCount) * 100 : 4}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{month}</span>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
