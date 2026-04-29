"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, List, PieChart, Wallet, Tags, Settings, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/budgets",      label: "Budgets",      icon: Wallet },
  { href: "/reports",      label: "Reports",      icon: PieChart },
  { href: "/categories",   label: "Categories",   icon: Tags },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

function LogoMark() {
  return (
    <div
      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[15px] font-bold text-[#080705] shrink-0"
      style={{ background: "var(--gold-gradient)" }}
    >
      ₦
    </div>
  );
}

function BrandText() {
  return (
    <div>
      <p className="text-[9px] tracking-[0.35em] uppercase text-gold-dim leading-none mb-0.5">TrackIt</p>
      <p className="font-display text-base font-semibold text-text leading-none">Finance OS</p>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={[
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium no-underline transition-all duration-150",
              active
                ? "bg-gold-bg text-gold font-bold"
                : "border border-transparent text-muted hover:text-text hover:bg-surface",
            ].join(" ")}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarInner = (
    <>
      <div className="flex items-center gap-2.5 px-4 py-4 ">
        <LogoMark />
        <BrandText />
      </div>
      <div className="flex-1 px-3 py-3">
        <p className="text-[9px] tracking-[0.25em] uppercase text-faint px-3.5 mb-2">Menu</p>
        <SidebarNav />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg flex font-sans text-text">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-bg-subtle sticky top-0 h-screen overflow-y-auto">
        {sidebarInner}
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header */}
        <header className="h-[69px] flex items-center justify-between px-5 bg-bg-subtle sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border text-muted cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={15} />
            </button>
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold-dim font-bold">TrackIt NG</span>
          </div>
          <ThemeToggle size={32} />
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="w-full mx-auto px-5 py-5">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[220px] bg-bg-subtle border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-3.5 py-4">
              <div className="flex items-center gap-2.5">
                <LogoMark />
                <BrandText />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted cursor-pointer bg-transparent border-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-3 py-2">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
