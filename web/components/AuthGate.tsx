"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setReady(true);
      return;
    }
    router.push("/login");
  }, [router]);

  if (!ready) {
    return <div className="px-6 py-10 text-sm text-muted">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
