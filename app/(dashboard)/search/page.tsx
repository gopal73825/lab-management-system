"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Package, FlaskConical, Cpu, AlertCircle } from "lucide-react";
import { assetService } from "@/services/assetService";
import { labService } from "@/services/labService";
import { systemService } from "@/services/systemService";
import { complaintService } from "@/services/complaintService";
import { StatusBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Asset, Lab, System, Complaint } from "@/types";

interface Results {
  assets: Asset[];
  labs: Lab[];
  systems: System[];
  complaints: Complaint[];
}

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState<Results>({ assets: [], labs: [], systems: [], complaints: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    const q = query.toLowerCase();
    Promise.all([assetService.getAll(), labService.getAll(), systemService.getAll(), complaintService.getAll()])
      .then(([assets, labs, systems, complaints]) => {
        setResults({
          assets: assets.filter((a) => a.assetId.toLowerCase().includes(q) || a.assetName.toLowerCase().includes(q)),
          labs: labs.filter((l) => l.labName.toLowerCase().includes(q) || l.labCode.toLowerCase().includes(q)),
          systems: systems.filter((s) => s.systemNumber.toLowerCase().includes(q)),
          complaints: complaints.filter((c) => c.complaintNo.toLowerCase().includes(q) || c.problemDescription.toLowerCase().includes(q)),
        });
      })
      .finally(() => setLoading(false));
  }, [query]);

  const total = results.assets.length + results.labs.length + results.systems.length + results.complaints.length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-gray-400" />
          <h1 className="page-title">Search Results</h1>
        </div>
        <p className="text-sm text-gray-500">
          {loading ? "Searching…" : query ? `${total} result${total !== 1 ? "s" : ""} for "${query}"` : "Enter a search term in the top bar"}
        </p>
      </div>

      {loading && <div className="card p-4"><TableSkeleton /></div>}

      {!loading && (
        <>
          {results.assets.length > 0 && (
            <section className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-500" />
                <h2 className="section-title">Assets ({results.assets.length})</h2>
              </div>
              {results.assets.map((a) => (
                <Link key={a.id} href={`/assets/${a.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.assetName}</p>
                    <p className="text-xs text-gray-500 font-mono">{a.assetId} · {a.category}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </section>
          )}

          {results.labs.length > 0 && (
            <section className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-500" />
                <h2 className="section-title">Labs ({results.labs.length})</h2>
              </div>
              {results.labs.map((l) => (
                <Link key={l.id} href={`/labs/${l.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{l.labName}</p>
                    <p className="text-xs text-gray-500">{l.labCode} · {l.building}</p>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {results.systems.length > 0 && (
            <section className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <h2 className="section-title">Systems ({results.systems.length})</h2>
              </div>
              {results.systems.map((s) => (
                <Link key={s.id} href={`/systems/${s.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.systemNumber}</p>
                    <p className="text-xs text-gray-500">{s.cpu} · {s.ram}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </section>
          )}

          {results.complaints.length > 0 && (
            <section className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <h2 className="section-title">Complaints ({results.complaints.length})</h2>
              </div>
              {results.complaints.map((c) => (
                <Link key={c.id} href={`/complaints/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.complaintNo}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{c.problemDescription}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </section>
          )}

          {total === 0 && query && (
            <div className="card p-16 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Searching…</div>}>
      <SearchResults />
    </Suspense>
  );
}
