const faqs = [
  { q: "Does TrackIt need internet?",       a: "Yes. The Telegram bot and deployed web dashboard need internet because they talk to the hosted backend. The app is designed to be lightweight and low-data, not fully offline yet." },
  { q: "Is my data safe?",                  a: "Data is stored in the backend database and protected by simple auth on the web app. We don't sell your data." },
  { q: "Can I export my data?",             a: "Absolutely. Use the CSV export from Telegram or the web app at any time." },
  { q: "What currencies are supported?",    a: "TrackIt is built specifically for Naira (₦). All analytics and summaries are formatted for Nigerian spending." },
  { q: "How do I set a budget?",            a: "Send /budget 25000 groceries in Telegram or use the budget panel in the web dashboard." },
];

export default function FAQPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="max-w-[560px] mb-16">
        <span className="t-badge">FAQ</span>
        <div className="t-divider" />
        <h1 className="t-display text-[clamp(36px,5vw,60px)]">Quick answers.</h1>
      </div>

      <div className="flex flex-col gap-3 max-w-[760px]">
        {faqs.map((item, i) => (
          <div key={item.q} className="t-panel p-7 grid grid-cols-[40px_1fr] gap-4 items-start">
            <span className="font-display text-xl text-gold opacity-40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="t-display text-xl mb-2.5">{item.q}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
