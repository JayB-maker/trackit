"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Budget, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BudgetForm = { category_id: number; limit_amount: number; period: string };

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: budgets } = useQuery<Budget[]>({ queryKey: ["budgets"], queryFn: () => api.budgets() as Promise<Budget[]> });
  const { data: categories } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => api.categories() as Promise<Category[]> });
  const categoryMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const form = useForm<BudgetForm>({ defaultValues: { category_id: categories?.[0]?.id || 0, limit_amount: 0, period: "monthly" } });

  const mutation = useMutation({
    mutationFn: (p: BudgetForm) => api.createBudget({ category_id: Number(p.category_id), limit_amount: Number(p.limit_amount), period: p.period }),
    onSuccess: () => { toast.success("Budget saved"); queryClient.invalidateQueries({ queryKey: ["budgets"] }); setOpen(false); form.reset(); },
    onError: () => toast.error("Could not save budget"),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="t-label">Finance</p>
          <h2 className="font-display text-[28px] font-semibold text-text leading-none">Budgets</h2>
        </div>
        <Button onClick={() => setOpen(true)}>Add budget</Button>
      </div>

      {budgets?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="t-panel p-4 md:p-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold-dim mb-2">{budget.period}</p>
              <p className="text-base font-semibold text-text mb-3">{categoryMap.get(budget.category_id) || "Uncategorized"}</p>
              <p className="font-display text-[30px] font-semibold text-gold leading-none">₦{budget.limit_amount.toLocaleString()}</p>
              <p className="text-[11px] text-muted mt-1">Limit</p>
              <div className="mt-3.5 h-[3px] bg-border rounded-full">
                <div className="h-[3px] w-0 rounded-full" style={{ background: "var(--gold-gradient)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="t-panel p-9 text-center">
          <p className="text-[15px] font-semibold text-text mb-1">No budgets set yet</p>
          <p className="text-[13px] text-muted">Set limits to guide your spending by category.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader><DialogTitle>Add budget</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="flex flex-col gap-3.5">
          <div>
            <label className="t-label">Category</label>
            <Select {...form.register("category_id", { required: true })}>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><label className="t-label">Limit (₦)</label><Input type="number" {...form.register("limit_amount", { valueAsNumber: true, required: true })} /></div>
          <div>
            <label className="t-label">Period</label>
            <Select {...form.register("period", { required: true })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
          <Button type="submit" className="mt-1">Save budget</Button>
        </form>
      </Dialog>
    </div>
  );
}
