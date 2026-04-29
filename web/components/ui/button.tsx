"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline" | "link";
}

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-btn text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-[opacity,transform,background] duration-200 px-5 py-2 whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<string, string> = {
  default:
    "text-[#080705] border-0 hover:opacity-90 hover:-translate-y-px",
  secondary:
    "bg-surface border border-border text-muted hover:border-border-gold hover:text-gold",
  ghost:
    "bg-transparent border border-border text-muted hover:border-border-gold hover:text-gold",
  outline:
    "bg-transparent border border-border text-muted hover:border-border-gold hover:text-gold",
  destructive:
    "bg-danger-bg border border-danger-border text-danger hover:opacity-90",
  link:
    "bg-transparent border-0 text-gold underline underline-offset-2 tracking-normal normal-case px-0 py-0",
};

function Button({ className, variant = "default", style, ...props }: ButtonProps) {
  const isDefault = variant === "default";
  return (
    <button
      className={cn(base, variants[variant], className)}
      style={isDefault ? { background: "var(--gold-gradient)", ...style } : style}
      {...props}
    />
  );
}

export { Button };
