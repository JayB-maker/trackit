"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Summary } from "@/lib/types";
import { Button } from "@/components/ui/button";

async function downloadCsv() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const res = await fetch(`${base}/api/v1/export/csv`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("trackit_token") || ""}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "trackit_export.csv"; a.click();
  window.URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const daily   = useQuery<Summary>({ queryKey: ["summary", "today"], queryFn: () => api.summary("today") as Promise<Summary> });
  const weekly  = useQuery<Summary>({ queryKey: ["summary", "week"],  queryFn: () => api.summary("week")  as Promise<Summary> });
  const monthly = useQuery<Summary>({ queryKey: ["summary", "month"], queryFn: () => api.summary("month") as Promise<Summary> });

  const periods = [
    { label: "Today",      data: daily.data },
    { label: "This Week",  data: weekly.data },
    { label: "This Month", data: monthly.data },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="t-label">Analytics</p>
          <h2 className="font-display text-[28px] font-semibold text-text leading-none">Reports</h2>
        </div>
        <Button variant="secondary" onClick={() => downloadCsv().then(() => toast.success("Report exported")).catch(() => toast.error("Export failed"))}>
          Export CSV
        </Button>
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {periods.map((item) => (
          <div key={item.label} className="t-panel p-4 md:p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold-dim mb-2">{item.label}</p>
            <p className="font-display text-3xl font-semibold text-gold leading-none">₦{item.data?.total_spent?.toLocaleString() || "0"}</p>
            <p className="text-xs text-muted mt-1.5">Top: {item.data?.top_category || "N/A"}</p>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div className="t-panel p-4 md:p-5">
        <p className="t-label">Breakdown</p>
        <p className="font-display text-xl font-semibold text-text mb-4">Monthly breakdown</p>
        {monthly.data?.breakdown?.length ? (
          <div className="flex flex-col gap-3">
            {monthly.data.breakdown.map((item) => {
              const pct = Math.round((item.total / (monthly.data?.total_spent || 1)) * 100);
              return (
                <div key={item.category}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-text">{item.category}</span>
                    <span className="text-[13px] text-muted">
                      ₦{item.total.toLocaleString()} <span className="text-gold">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1 bg-border rounded-full">
                    <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: "var(--gold-gradient)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-muted">No data for this month yet.</p>
        )}
      </div>
    </div>
  );
}
