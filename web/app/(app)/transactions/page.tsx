"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Expense, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ExpenseForm = { amount: number; category_id: number; description?: string; date: string };

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data: expenses } = useQuery<Expense[]>({ queryKey: ["expenses", startDate, endDate], queryFn: () => api.expenses(startDate, endDate) as Promise<Expense[]> });
  const { data: categories } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => api.categories() as Promise<Category[]> });

  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!expenses) return [];
    return expenses
      .filter((e) => categoryFilter === "all" || e.category_id === Number(categoryFilter))
      .filter((e) => `${e.description || ""} ${categoryMap.get(e.category_id) || ""}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, categoryFilter, search, categoryMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const form = useForm<ExpenseForm>({ defaultValues: { amount: 0, category_id: categories?.[0]?.id || 0, description: "", date: new Date().toISOString().slice(0, 10) } });

  const createMutation = useMutation({
    mutationFn: (p: ExpenseForm) => api.createExpense({ amount: Number(p.amount), category_id: Number(p.category_id), description: p.description || null, date: p.date, is_recurring: false, recurring_period: null, allow_duplicate: false }),
    onSuccess: () => { toast.success("Transaction saved"); queryClient.invalidateQueries({ queryKey: ["expenses"] }); setOpen(false); form.reset(); },
    onError: () => toast.error("Could not save transaction"),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="t-label">Finance</p>
          <h2 className="font-display text-[28px] font-semibold text-text leading-none">Transactions</h2>
        </div>
        <Button onClick={() => setOpen(true)}>Add transaction</Button>
      </div>

      {/* Filters */}
      <div className="t-panel p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className="t-label">Search</label><Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div>
            <label className="t-label">Category</label>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><label className="t-label">From</label><DatePicker value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div><label className="t-label">To</label><DatePicker value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        </div>
      </div>

      {paged.length ? (
        <>
          <div className="t-panel overflow-hidden p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Category", "Description", "Amount"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[10px] tracking-[0.18em] uppercase text-faint font-bold ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((e, idx) => (
                  <tr key={e.id} className={idx < paged.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 text-muted">{e.date}</td>
                    <td className="px-4 py-3 text-text font-semibold">{categoryMap.get(e.category_id) || "Uncategorized"}</td>
                    <td className="px-4 py-3 text-muted">{e.description || "—"}</td>
                    <td className="px-4 py-3 text-right text-gold font-bold text-sm">₦{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-[13px] text-muted">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        </>
      ) : (
        <div className="t-panel p-9 text-center">
          <p className="text-[15px] font-semibold text-text mb-1">No transactions yet</p>
          <p className="text-[13px] text-muted">Add your first expense to populate this list.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader><DialogTitle>Add transaction</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="flex flex-col gap-3.5">
          <div><label className="t-label">Amount</label><Input type="number" {...form.register("amount", { valueAsNumber: true, required: true })} /></div>
          <div>
            <label className="t-label">Category</label>
            <Select {...form.register("category_id", { required: true })}>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><label className="t-label">Description</label><Input {...form.register("description")} /></div>
          <div><label className="t-label">Date</label><DatePicker {...form.register("date")} /></div>
          <Button type="submit" className="mt-1">Save transaction</Button>
        </form>
      </Dialog>
    </div>
  );
}
