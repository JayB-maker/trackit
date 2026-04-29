"use client";

import Link from "next/link";

const productLinks = [
  { href: "/features",     label: "Features" },
  { href: "/bot",          label: "Telegram Bot" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/dashboard",    label: "Dashboard" },
];
const companyLinks = [
  { href: "/about",   label: "About" },
  { href: "/faq",     label: "FAQ" },
  { href: "/support", label: "Support" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block text-[13px] text-muted no-underline mb-2.5 transition-colors duration-150 hover:text-gold"
    >
      {label}
    </Link>
  );
}

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-bg px-6">
      <div className="max-w-[1280px] mx-auto py-12">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-10 pb-10 border-b border-border">
          {/* Brand */}
          <div className="max-w-[280px]">
            <div className="flex items-center gap-3 mb-3.5">
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[15px] font-bold text-[#080705]"
                style={{ background: "var(--gold-gradient)" }}
              >
                ₦
              </div>
              <p className="font-display text-lg font-semibold text-text m-0">TrackIt NG</p>
            </div>
            <p className="text-[13px] leading-relaxed text-muted m-0">
              Nigerian-first personal finance. Fast logging, smart insights, low-data.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex gap-14 flex-wrap">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold-dim font-bold mb-4">Product</p>
              {productLinks.map((l) => <FooterLink key={l.href} {...l} />)}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold-dim font-bold mb-4">Company</p>
              {companyLinks.map((l) => <FooterLink key={l.href} {...l} />)}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <p className="text-xs text-faint m-0">
            © {new Date().getFullYear()} TrackIt NG. All rights reserved.
          </p>
          <a href="mailto:hello@trackit.ng" className="text-xs text-gold-dim no-underline hover:text-gold transition-colors duration-150">
            hello@trackit.ng
          </a>
        </div>
      </div>
    </footer>
  );
}
