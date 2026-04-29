import Link from "next/link";

export default function GetStartedPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[560px] mb-16">
        <span className="t-badge">Get started</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)]">Choose your entry.</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Telegram */}
        <div className="bg-gold-bg border border-border-gold rounded-[20px] p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] text-[#080705] mb-5 shrink-0" style={{ background: "var(--gold-gradient)" }}>
            ✈
          </div>
          <h2 className="t-display text-[26px] mb-3">Telegram first</h2>
          <p className="text-sm leading-relaxed text-muted mb-7">
            Use the bot for fast logging. Type /start and you're ready in seconds.
          </p>
          <Link href="https://t.me/trackit_ng_bot" className="t-btn-primary">
            Open Telegram Bot →
          </Link>
        </div>

        {/* Web app */}
        <div className="t-panel p-10">
          <div className="w-12 h-12 rounded-[14px] bg-surface border border-border flex items-center justify-center text-[22px] text-text mb-5 shrink-0">
            ⊞
          </div>
          <h2 className="t-display text-[26px] mb-3">Web dashboard</h2>
          <p className="text-sm leading-relaxed text-muted mb-7">
            View trends, budget progress, and analytics on the full web app.
          </p>
          <Link href="/login" className="t-btn-ghost">
            Open Web App →
          </Link>
        </div>
      </div>
    </div>
  );
}
