"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CategoryForm = { name: string };

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: () => api.categories() as Promise<Category[]> });
  const form = useForm<CategoryForm>({ defaultValues: { name: "" } });

  const mutation = useMutation({
    mutationFn: (p: CategoryForm) => api.createCategory(p),
    onSuccess: () => { toast.success("Category added"); queryClient.invalidateQueries({ queryKey: ["categories"] }); form.reset(); },
    onError: () => toast.error("Could not add category"),
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="t-label">Finance</p>
        <h2 className="font-display text-[28px] font-semibold text-text leading-none">Categories</h2>
      </div>

      <div className="t-panel p-4">
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="t-label">Category name</label>
            <Input {...form.register("name", { required: true })} placeholder="e.g. Gifts" />
          </div>
          <Button type="submit">Add category</Button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {categories?.map((cat) => (
          <div key={cat.id} className="t-panel p-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-text">{cat.name}</p>
            {cat.default_flag && (
              <span className="text-[9px] tracking-[0.15em] uppercase text-gold bg-gold-bg px-2 py-0.5 rounded-btn font-bold">
                Default
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
