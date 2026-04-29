import Link from "next/link";

const featureItems = [
  { icon: "✦", title: "Telegram-first logging", desc: "Send a message, get it saved. No app switching." },
  { icon: "◈", title: "Low-data tracking",      desc: "Simple requests keep logging light when connectivity is limited." },
  { icon: "◎", title: "Budgets & alerts",        desc: "Set limits by category, get nudged before overspending." },
  { icon: "⊞", title: "CSV export",              desc: "Pull your data anytime for deeper analysis." },
  { icon: "₦", title: "Naira insights",          desc: "Charts and summaries built for Nigerian spending patterns." },
  { icon: "↻", title: "Recurring expenses",      desc: "Handle rent, subscriptions, and bills automatically." },
];

const testimonials = [
  { name: "Ada",    role: "Student · Lagos",        quote: "I track daily spends and still save for data every month." },
  { name: "Kunle",  role: "Trader · Kano",          quote: "Quick logging on Telegram keeps me disciplined without effort." },
  { name: "Zainab", role: "Salary earner · Abuja",  quote: "The monthly view finally shows me where my money quietly leaks." },
];

const snapshotItems = [
  { label: "Food & groceries", amount: "₦5,800", when: "Today",     pct: 72 },
  { label: "Transport",        amount: "₦2,400", when: "Today",     pct: 45 },
  { label: "Airtime",          amount: "₦500",   when: "Yesterday", pct: 18 },
];

const budgets = [
  { label: "Transport", current: 18000, limit: 25000 },
  { label: "Food",      current: 22000, limit: 30000 },
];

const barHeights = [40, 65, 30, 80, 55, 70, 45, 90, 60, 75, 50, 85];

export default function HomePage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="max-w-[1280px] mx-auto px-6 pt-20 pb-16 lg:pt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="t-badge">Made for Nigeria</span>
          <h1 className="t-display text-[clamp(44px,6vw,76px)] mb-5">
            Track your Naira story in minutes,{" "}
            <em className="italic text-gold">not spreadsheets.</em>
          </h1>
          <p className="text-[17px] leading-[1.7] text-muted max-w-[480px] mb-9">
            TrackIt NG keeps your daily spending in sync across Telegram and the web.
            Fast, lightweight, and built for low data usage.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <Link href="https://t.me/thetracking_bot" className="t-btn-primary">Use on Telegram →</Link>
            <Link href="/login" className="t-btn-ghost">Open Web App</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-[380px]">
            {[{ label: "Avg saved / month", value: "₦42k" }, { label: "Tracked today", value: "₦8.2k" }].map((s) => (
              <div key={s.label} className="t-panel p-5">
                <p className="text-[11px] text-muted mb-1.5">{s.label}</p>
                <p className="font-display text-[28px] text-text">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live snapshot — hidden on mobile */}
        <div className="t-panel p-7 relative overflow-hidden hidden lg:block">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold tracking-[0.08em] text-muted">Live snapshot</p>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-btn bg-gold-bg text-[11px] font-semibold text-gold">
              <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
              Low-data
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {snapshotItems.map((item) => (
              <div key={item.label} className="t-panel p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-text mb-0.5">{item.label}</p>
                    <p className="text-[11px] text-faint">{item.when}</p>
                  </div>
                  <p className="font-display text-xl text-text">{item.amount}</p>
                </div>
                <div className="h-0.5 bg-border rounded-full">
                  <div className="h-0.5 rounded-full" style={{ width: `${item.pct}%`, background: "var(--gold-gradient)" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-card bg-gold-bg border border-border-gold flex items-center justify-between">
            <p className="text-xs text-muted">Weekly spend</p>
            <p className="font-display text-[22px] text-gold">₦24,100</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="mb-12">
          <span className="t-badge">Features</span>
          <div className="t-divider" />
          <h2 className="t-display text-[clamp(32px,4vw,48px)] max-w-[500px]">
            Everything you need,{" "}
            <em className="italic text-faint">nothing you don't.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureItems.map((f, i) => (
            <div key={f.title} className="t-panel p-7 relative overflow-hidden">
              <span className="text-[22px] text-gold block mb-3.5 opacity-80">{f.icon}</span>
              <h3 className="t-display text-xl mb-2">{f.title}</h3>
              <p className="text-[13px] leading-relaxed text-muted">{f.desc}</p>
              <span className="absolute bottom-4 right-5 font-display text-[48px] font-semibold leading-none pointer-events-none select-none text-gold opacity-[0.06]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="t-panel p-8 lg:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
            <div>
              <span className="t-badge">How it works</span>
              <div className="t-divider" />
              <h2 className="t-display text-[clamp(30px,4vw,44px)] mb-4">
                Telegram in.{" "}
                <em className="italic text-gold">Insights out.</em>
              </h2>
              <p className="text-[15px] leading-[1.7] text-muted mb-9">
                Add expenses via quick messages, set budgets by category, and open the web app whenever you want richer analytics.
              </p>
              <div className="flex flex-col gap-5">
                {[
                  { step: "01", text: 'Send "2000 food" in Telegram' },
                  { step: "02", text: "Track budgets and receive weekly summaries" },
                  { step: "03", text: "Open dashboards for charts and trends" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-5">
                    <span className="font-display text-[32px] text-gold opacity-30 shrink-0 w-[52px]">{item.step}</span>
                    <p className="text-[15px] text-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini dashboard */}
            <div className="flex flex-col gap-3.5">
              <div className="t-panel p-5">
                <p className="t-label mb-3.5">Budget status</p>
                {budgets.map((b) => (
                  <div key={b.label} className="mb-3.5">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-muted">{b.label}</span>
                      <span className="text-xs text-faint">₦{(b.current / 1000).toFixed(0)}k / ₦{(b.limit / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1 bg-border rounded-full">
                      <div className="h-1 rounded-full" style={{ width: `${(b.current / b.limit) * 100}%`, background: "var(--gold-gradient)" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-card bg-gold-bg border border-border-gold flex items-center justify-between">
                <div>
                  <p className="t-label mb-1">Daily average</p>
                  <p className="font-display text-[36px] text-gold">₦3,420</p>
                </div>
                <span className="font-display text-[32px] text-gold opacity-20">₦</span>
              </div>
              <div className="t-panel p-5">
                <p className="t-label mb-3">This month</p>
                <div className="flex gap-1 items-end h-12">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-colors duration-200"
                      style={{
                        height: `${h}%`,
                        background: i === 11 ? "var(--gold-gradient)" : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="t-badge">Testimonials</span>
          <div className="t-divider" />
          <h2 className="t-display text-[clamp(28px,3vw,40px)]">Loved by everyday Nigerians.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="t-panel p-8">
              <p className="font-display text-[22px] italic text-text leading-snug mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-bg border border-border-gold flex items-center justify-center font-display text-sm font-semibold text-gold shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-text">{t.name}</p>
                  <p className="text-[11px] text-faint">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="bg-gold-bg border border-border-gold rounded-[24px] p-8 lg:p-14 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <div>
            <span className="t-badge">Ready to start?</span>
            <h3 className="t-display text-[clamp(26px,3vw,36px)]">Track your spending today.</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="https://t.me/thetracking_bot" className="t-btn-primary">Use on Telegram →</Link>
            <Link href="/login" className="t-btn-ghost">Open Web App</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
