import AppShell from "@/components/AppShell";
import Providers from "./providers";
import AuthGate from "@/components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </Providers>
  );
}
