import Link from "next/link";

const whatYouGet = [
  "Telegram-first logging with instant confirmations",
  "Budgets for tracking category spending limits",
  "Web analytics for weekly and monthly reviews",
  "CSV exports whenever you need your records",
];

export default function AboutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[640px] mb-16">
        <span className="t-badge">About</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)] mb-5">
          Built for real{" "}
          <em className="italic text-gold">spending habits.</em>
        </h1>
        <p className="text-base leading-[1.7] text-muted">
          TrackIt is a Nigerian-first personal finance tool built around speed, clarity, and low-data access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="t-panel p-9">
          <h2 className="t-display text-2xl mb-4">Why we built TrackIt</h2>
          <p className="text-sm leading-[1.75] text-muted">
            Most finance apps assume constant data access. TrackIt keeps logging fast even with low connectivity,
            and focuses on the habits that matter: transport, food, airtime, and recurring bills.
          </p>
        </div>

        <div className="t-panel p-9">
          <h2 className="t-display text-2xl mb-5">What you get</h2>
          <div className="flex flex-col gap-3">
            {whatYouGet.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-gold mt-0.5 shrink-0">✦</span>
                <p className="text-sm leading-snug text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission banner */}
        <div className="md:col-span-2 bg-gold-bg border border-border-gold rounded-[20px] p-10 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display text-[clamp(20px,2.5vw,28px)] italic leading-snug text-text max-w-[480px]">
            "Finance tools should work for the way Nigerians actually live — on the go, on mobile, and with limited data."
          </p>
          <Link href="/get-started" className="t-btn-primary">Start tracking →</Link>
        </div>
      </div>
    </div>
  );
}
