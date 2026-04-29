import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[560px] mb-16">
        <span className="t-badge">Support</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)] mb-4">We're here to help.</h1>
        <p className="text-base leading-[1.7] text-muted">
          Reach out for onboarding, troubleshooting, or feature requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email */}
        <div className="t-panel p-9">
          <span className="text-2xl text-gold block mb-4">✉</span>
          <h2 className="t-display text-2xl mb-3.5">Contact us</h2>
          <div className="flex flex-col gap-2">
            <a href="mailto:hello@trackit.ng" className="text-sm text-gold no-underline hover:underline">
              hello@trackit.ng
            </a>
            <a href="tel:+2348000000000" className="text-sm text-muted no-underline hover:text-text transition-colors duration-150">
              +234 800 000 0000
            </a>
          </div>
          <p className="text-xs text-faint mt-4">Response within 24 hours on business days.</p>
        </div>

        {/* Telegram */}
        <div className="bg-gold-bg border border-border-gold rounded-[20px] p-9 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
          <span className="text-2xl text-gold block mb-4">✈</span>
          <h2 className="t-display text-2xl mb-3.5">Chat on Telegram</h2>
          <p className="text-sm leading-relaxed text-muted mb-7">
            The fastest way to get help is through the bot. Most issues resolved in minutes.
          </p>
          <Link href="https://t.me/thetracking_bot" className="t-btn-primary">
            Open Telegram Bot →
          </Link>
        </div>
      </div>
    </div>
  );
}
