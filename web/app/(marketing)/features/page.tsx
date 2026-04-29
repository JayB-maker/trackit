import Link from "next/link";

const items = [
  { icon: "⚡", title: "Quick add",           detail: "Log expenses in seconds via Telegram or the web app. No friction, just data." },
  { icon: "◈", title: "Low-data tracking",    detail: "Fast Telegram and web requests keep logging light when connectivity is limited." },
  { icon: "◎", title: "Budget tracking",      detail: "Set category limits and review them from Telegram or the web dashboard." },
  { icon: "↻", title: "Recurring expenses",   detail: "Handle repeat bills like rent or subscriptions automatically." },
  { icon: "⊞", title: "CSV export",           detail: "Export to CSV whenever you need deeper analysis outside the app." },
  { icon: "₦", title: "Naira analytics",      detail: "Charts and summaries tailored specifically for Nigerian spending." },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[640px] mb-16">
        <span className="t-badge">Features</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)] mb-5">
          Everything you need,{" "}
          <em className="italic text-faint">in one place.</em>
        </h1>
        <p className="text-base leading-[1.7] text-muted">
          TrackIt keeps daily expenses lightweight and insightful, even with low data.
        </p>
        <div className="mt-7">
          <Link href="/get-started" className="t-btn-primary">Get started →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={item.title} className="t-panel p-8 relative overflow-hidden">
            <span className="text-2xl text-gold block mb-4">{item.icon}</span>
            <h3 className="t-display text-[22px] mb-2.5">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{item.detail}</p>
            <span className="absolute bottom-3 right-4 font-display text-[52px] font-semibold leading-none pointer-events-none select-none text-gold opacity-[0.05]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
