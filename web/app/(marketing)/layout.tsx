import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text font-sans relative">
      {/* Ambient glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full opacity-50" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
      </div>
      <div className="relative z-10">
        <MarketingHeader />
        <main className="pt-[72px]">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
