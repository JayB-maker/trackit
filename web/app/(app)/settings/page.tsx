"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, auth, setToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LoginForm = { email: string; password: string };
type LinkForm  = { email: string; code: string; password: string };

function Section({ children }: { children: React.ReactNode }) {
  return <div className="t-panel p-5">{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-display text-[22px] font-semibold text-text mb-1">{children}</p>;
}
function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const [linkOpen, setLinkOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { data: me } = useQuery<{ email?: string; telegram_id?: string }>({
    queryKey: ["me"],
    queryFn: () => api.me() as Promise<{ email?: string; telegram_id?: string }>,
  });

  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const linkForm  = useForm<LinkForm>({ defaultValues: { email: "", code: "", password: "" } });

  const isAnonymous = !me?.email;
  const isLinked    = Boolean(me?.telegram_id);

  async function handleLogin(values: LoginForm) {
    try { const data = await auth.login(values.email, values.password); setToken(data.access_token); toast.success("Logged in"); }
    catch { toast.error("Login failed"); }
  }
  async function handleLink(values: LinkForm) {
    try { const data = await api.linkVerify(values); setToken(data.access_token); toast.success("Account linked"); setLinkOpen(false); }
    catch { toast.error("Could not verify code"); }
  }
  function handleLogout() {
    localStorage.removeItem("trackit_token");
    toast.success("Logged out");
    setLogoutOpen(false);
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col gap-3.5 max-w-[560px]">
      <div>
        <p className="t-label">Preferences</p>
        <h2 className="font-display text-[28px] font-semibold text-text leading-none">Settings</h2>
      </div>

      <Section>
        <SectionTitle>Account</SectionTitle>
        <p className="text-[13px] text-muted mb-3.5">Manage your login and Telegram link.</p>
        <StatusRow label="Status"   value={isAnonymous ? "Guest" : "Logged in"} />
        <StatusRow label="Email"    value={me?.email || "Not set"} />
        <StatusRow label="Telegram" value={isLinked ? "Linked ✓" : "Not linked"} />
        {!isAnonymous && <Button variant="ghost" onClick={() => setLogoutOpen(true)} className="mt-3.5">Logout</Button>}
      </Section>

      {isAnonymous && (
        <Section>
          <SectionTitle>Login</SectionTitle>
          <p className="text-[13px] text-muted mb-3.5">Sign in to sync your data.</p>
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-3">
            <div><label className="t-label">Email</label><Input {...loginForm.register("email", { required: true })} /></div>
            <div><label className="t-label">Password</label><Input type="password" {...loginForm.register("password", { required: true })} /></div>
            <Button type="submit" className="self-start">Login</Button>
          </form>
        </Section>
      )}

      {!isLinked ? (
        <Section>
          <SectionTitle>Link Telegram</SectionTitle>
          <ol className="flex flex-col gap-2 my-3 list-none">
            {[
              <span key={0}>Open Telegram and send: <span className="text-text font-semibold">/link you@example.com</span></span>,
              "Check your email for the verification code.",
              "Click the button below and enter the code.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-muted">
                <span className="text-gold font-bold shrink-0">0{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Button variant="secondary" onClick={() => setLinkOpen(true)}>Link Telegram</Button>
        </Section>
      ) : (
        <Section>
          <SectionTitle>Telegram linked</SectionTitle>
          <p className="text-[13px] text-muted">Your Telegram account is connected.</p>
        </Section>
      )}

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogHeader><DialogTitle>Verify Telegram link</DialogTitle></DialogHeader>
        <p className="text-[13px] text-muted mb-4 leading-relaxed">Use /link in Telegram to request a code. We also send the code to your email.</p>
        <form onSubmit={linkForm.handleSubmit(handleLink)} className="flex flex-col gap-3">
          <div><label className="t-label">Email</label><Input {...linkForm.register("email", { required: true })} /></div>
          <div><label className="t-label">Email code</label><Input {...linkForm.register("code", { required: true })} /></div>
          <div><label className="t-label">Set password</label><Input type="password" {...linkForm.register("password", { required: true })} /></div>
          <Button type="submit" className="mt-1">Verify & link →</Button>
        </form>
      </Dialog>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogHeader><DialogTitle>Confirm logout</DialogTitle></DialogHeader>
        <p className="text-[13px] text-muted mb-5">Are you sure you want to log out?</p>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </Dialog>
    </div>
  );
}
