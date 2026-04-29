import Link from "next/link";

const commands = [
  { cmd: "/start",                   desc: "Activate your wallet." },
  { cmd: "2000 transport",           desc: "Log a spend with amount + category." },
  { cmd: "/budget 25000 groceries",  desc: "Set a category spending limit." },
  { cmd: "/summary week",            desc: "Get a quick weekly insight." },
];

export default function BotPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[640px] mb-16">
        <span className="t-badge">Telegram Bot</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)] mb-5">
          Log expenses{" "}
          <em className="italic text-gold">in seconds.</em>
        </h1>
        <p className="text-base leading-[1.7] text-muted">
          Send a message, get it saved. TrackIt works even with low data, so you can log spending anywhere in Nigeria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Commands */}
        <div className="t-panel p-9">
          <h2 className="t-display text-[26px] mb-6">Quick commands</h2>
          <div className="flex flex-col gap-3.5">
            {commands.map((c) => (
              <div key={c.cmd} className="flex gap-3.5 items-start">
                <code className="px-2.5 py-1 rounded-lg bg-gold-bg border border-border-gold text-xs font-mono text-gold whitespace-nowrap shrink-0">
                  {c.cmd}
                </code>
                <p className="text-[13px] leading-snug text-muted pt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Get started */}
        <div className="bg-gold-bg border border-border-gold rounded-[20px] p-9 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <h2 className="t-display text-[26px] mb-3.5">Get started</h2>
          <p className="text-sm leading-relaxed text-muted mb-7">
            Open the bot and start logging. Your data syncs to the web dashboard automatically.
          </p>
          <Link href="https://t.me/thetracking_bot" className="t-btn-primary">
            Open Telegram Bot →
          </Link>
        </div>
      </div>
    </div>
  );
}
