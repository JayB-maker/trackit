"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Summary, Expense, Budget, Category } from "@/lib/types";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import Link from "next/link";

function addDays(date: Date, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d;
}
function fmtDay(d: Date) { return d.toLocaleDateString("en-GB", { day: "2-digit" }); }

// Recharts tooltip needs real CSS values, not Tailwind classes
const tooltipStyle = {
  background: "var(--bg-subtle)",
  // border: "1px solid var(--border-gold)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--text)",
};

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`t-panel p-4 md:p-5 ${className}`}>{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="t-label">{children}</p>;
}

function EmptyState({ title, body, actionHref, actionLabel }: {
  title: string; body: string; actionHref?: string; actionLabel?: string;
}) {
  return (
    <div className="rounded-[10px] p-6 text-center">
      <p className="text-sm font-semibold text-text mb-1">{title}</p>
      <p className="text-sm text-muted">{body}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="t-btn-primary mt-3 text-[10px] px-4 py-1.5">{actionLabel}</Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary } = useQuery<Summary>({ queryKey: ["summary", "month"], queryFn: () => api.summary("month") as Promise<Summary> });
  const { data: budgets } = useQuery<Budget[]>({ queryKey: ["budgets"], queryFn: () => api.budgets() as Promise<Budget[]> });
  const { data: categories } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => api.categories() as Promise<Category[]> });

  const endDate = new Date();
  const startDate = addDays(endDate, -13);
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["expenses", startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)],
    queryFn: () => api.expenses(startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)) as Promise<Expense[]>,
  });

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const totalsByDate = useMemo(() => {
    const m = new Map<string, number>();
    expenses?.forEach((e) => m.set(e.date, (m.get(e.date) || 0) + e.amount));
    return m;
  }, [expenses]);

  const dailyData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(endDate, i - 6)).map((day) => {
      const iso = day.toISOString().slice(0, 10);
      return { day: fmtDay(day), current: totalsByDate.get(iso) || 0, last: totalsByDate.get(addDays(day, -7).toISOString().slice(0, 10)) || 0 };
    }), [endDate, totalsByDate]);

  const breakdown = summary?.breakdown || [];
  const totalSpent = summary?.total_spent || 0;
  const hasSpending = totalSpent > 0;
  const pieData = breakdown.slice(0, 3).map((item) => ({
    name: item.category,
    value: totalSpent ? Math.round((item.total / totalSpent) * 100) : 0,
  }));
  const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
  const recentExpenses = useMemo(() =>
    expenses ? [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5) : [],
    [expenses]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total spend",    value: `₦${totalSpent.toLocaleString()}`,                          sub: "Month to date" },
          { label: "Daily average",  value: `₦${summary?.daily_average?.toLocaleString() || "0"}`,      sub: "Based on spending days" },
          { label: "Active budgets", value: String(budgets?.length || 0),                               sub: "Categories under watch" },
        ].map((s) => (
          <Panel key={s.label}>
            <SectionLabel>{s.label}</SectionLabel>
            <p className="font-display text-3xl text-text leading-tight">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.sub}</p>
          </Panel>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
        <Panel>
          <div className="flex items-center justify-between mb-3">
            <div>
              <SectionLabel>Weekly spend</SectionLabel>
              <p className="text-[15px] font-semibold text-text">Last 7 days</p>
            </div>
            <Link href="/reports" className="text-xs text-gold no-underline hover:underline">View report →</Link>
          </div>
          {hasSpending ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barSize={8} >
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 11 }} dy={8} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-hover)" }} />
                  <Bar dataKey="current" fill="var(--chart-1)" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="last"    fill="var(--border)"  radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No spending data yet" body="Add your first expense to see weekly trends." actionHref="/transactions" actionLabel="Add transaction" />
          )}
        </Panel>

        <Panel>
          <SectionLabel>Category mix</SectionLabel>
          <p className="text-[15px] font-semibold text-text mb-3">Top categories</p>
          {hasSpending && pieData.length ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-2.5">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5 text-muted">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pieColors[i] }} />
                      {item.name}
                    </div>
                    <span className="font-bold text-text">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="No categories yet" body="Track expenses to see your spending mix." />
          )}
        </Panel>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Panel>
          <SectionLabel>Recent expenses</SectionLabel>
          <p className="text-[15px] font-semibold text-text mb-3">Last 5 transactions</p>
          {recentExpenses.length ? (
            <div className="flex flex-col gap-3">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-text">{categoryMap.get(e.category_id) || "Uncategorized"}</p>
                    <p className="text-[11px] text-muted">{e.date}</p>
                  </div>
                  <p className="text-sm font-bold text-gold">₦{e.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No transactions yet" body="Start by logging your first expense." actionHref="/transactions" actionLabel="Add expense" />
          )}
        </Panel>

        <Panel>
          <SectionLabel>Top categories</SectionLabel>
          <p className="text-[15px] font-semibold text-text mb-3">Most active this month</p>
          {breakdown.length ? (
            <div className="flex flex-col gap-3">
              {breakdown.slice(0, 8).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text">{item.category}</span>
                  <span className="text-[13px] text-muted">₦{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No categories yet" body="Track expenses to see which categories dominate." />
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <div>
              <SectionLabel>Spending trend</SectionLabel>
              <p className="text-[15px] font-semibold text-text">Last 7 days</p>
            </div>
            <Link href="/reports" className="text-xs text-gold no-underline hover:underline">View →</Link>
          </div>
          {hasSpending ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 11 }} dy={8} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="current" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="last"    stroke="var(--border)"  strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No trend yet" body="Add expenses to unlock your spending trend." />
          )}
        </Panel>
      </div>
    </div>
  );
}
