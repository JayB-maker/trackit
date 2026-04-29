import Link from "next/link";

const steps = [
  { title: "Connect Telegram", detail: "Start the bot and get an offline-ready wallet in seconds. No sign-up form, no friction." },
  { title: "Log expenses",     detail: 'Send quick messages like "2000 transport" and TrackIt records it instantly.' },
  { title: "Review insights",  detail: "Open the web app for charts, trends, budget progress, and deeper analytics." },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[580px] mb-16">
        <span className="t-badge">How it works</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)] mb-4">
          Simple, fast,{" "}
          <em className="italic text-gold">reliable.</em>
        </h1>
        <p className="text-base leading-[1.7] text-muted">
          Designed for low data environments and busy schedules.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-[800px]">
        {steps.map((step, i) => (
          <div key={step.title} className="t-panel p-9 grid grid-cols-[80px_1fr] gap-6 items-start">
            <div className="w-16 h-16 rounded-[16px] bg-gold-bg border border-border-gold flex items-center justify-center shrink-0">
              <span className="font-display text-[28px] text-gold">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div>
              <h3 className="t-display text-2xl mb-2.5">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3.5">
        <Link href="https://t.me/thetracking_bot" className="t-btn-primary">Start on Telegram →</Link>
        <Link href="/features" className="t-btn-ghost">See all features</Link>
      </div>
    </div>
  );
}
