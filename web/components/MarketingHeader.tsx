"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/",            label: "Home" },
  { href: "/features",    label: "Features" },
  { href: "/about",       label: "About" },
  { href: "/bot",         label: "Bot" },
  { href: "/faq",         label: "FAQ" },
  { href: "/support",     label: "Support" },
  { href: "/dashboard",   label: "Dashboard" },
];

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className={[
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-bg/90 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="no-underline flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base font-bold text-[#080705] shrink-0"
              style={{ background: "var(--gold-gradient)" }}
            >
              ₦
            </div>
            <div>
              <p className="text-[9px] tracking-[0.4em] text-gold-dim uppercase leading-none m-0">TrackIt NG</p>
              <p className="text-[13px] font-display font-semibold text-text leading-snug m-0">Money Studio</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted no-underline transition-colors duration-150 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle size={34} />
            <Link
              href="https://t.me/thetracking_bot"
              className="hidden md:inline-flex t-btn-primary text-[11px] px-5 py-2"
            >
              Open Telegram →
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-[10px] border border-border-gold bg-gold-bg text-text cursor-pointer text-lg"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-bg/97 backdrop-blur-2xl flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[15px] font-bold text-[#080705]"
                style={{ background: "var(--gold-gradient)" }}
              >
                ₦
              </div>
              <p className="font-display text-[13px] font-semibold text-text m-0">TrackIt NG</p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle size={36} />
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-[10px] border border-border bg-transparent text-text cursor-pointer flex items-center justify-center text-base"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 flex-1">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center justify-between py-3.5 border-b border-border font-display text-[26px] font-semibold no-underline transition-colors duration-150",
                  i === 0 ? "text-gold" : "text-muted hover:text-text",
                ].join(" ")}
              >
                {l.label}
                <span className="text-sm opacity-40">→</span>
              </Link>
            ))}
          </nav>

          <Link
            href="https://t.me/thetracking_bot"
            onClick={() => setOpen(false)}
            className="mt-7 block text-center py-4 rounded-[14px] text-xs font-bold tracking-[0.15em] uppercase text-[#080705] no-underline"
            style={{ background: "var(--gold-gradient)" }}
          >
            Open Telegram Bot →
          </Link>
        </div>
      )}
    </>
  );
}
