"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, authGuest, setToken, api } from "@/lib/api";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

type LoginForm = { email: string; password: string };
type LinkForm  = { email: string; code: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [linkOpen, setLinkOpen] = useState(false);
  const loginForm = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const linkForm  = useForm<LinkForm>({ defaultValues: { email: "", code: "", password: "" } });

  async function handleLogin(values: LoginForm) {
    try { const data = await auth.login(values.email, values.password); setToken(data.access_token); toast.success("Logged in"); router.push("/dashboard"); }
    catch { toast.error("Login failed"); }
  }
  async function handleGuest() {
    try { const data = await authGuest(); setToken(data.access_token); toast.success("Guest session started"); router.push("/dashboard"); }
    catch { toast.error("Could not start guest session"); }
  }
  async function handleLink(values: LinkForm) {
    try { const data = await api.linkVerify(values); setToken(data.access_token); toast.success("Account linked"); router.push("/dashboard"); }
    catch { toast.error("Could not verify code"); }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-10 font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full pointer-events-none opacity-50" style={{ background: "radial-gradient(circle, var(--gold-bg) 0%, transparent 70%)" }} />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5">
        <ThemeToggle size={34} />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand */}
        <div className="text-center mb-9">
          <span className="t-badge text-[10px]">TrackIt NG</span>
          <h1 className="t-display text-[clamp(34px,5vw,50px)] mt-2">Welcome back.</h1>
          <p className="mt-2.5 text-sm text-muted leading-relaxed">Log in with your email, or continue without an account.</p>
        </div>

        {/* Card */}
        <div className="t-panel p-8">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
            <div>
              <label className="t-label">Email</label>
              <input {...loginForm.register("email", { required: true })} type="email" className="t-input" />
            </div>
            <div>
              <label className="t-label">Password</label>
              <input {...loginForm.register("password", { required: true })} type="password" className="t-input" />
            </div>
            <button type="submit" className="t-btn-primary w-full justify-center mt-1">Log in →</button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-faint tracking-[0.1em]">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={handleGuest} className="t-btn-ghost w-full justify-center">Continue without account</button>
            <button type="button" onClick={() => setLinkOpen(true)} className="t-btn-ghost w-full justify-center">I started in Telegram</button>
          </div>
        </div>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogHeader><DialogTitle>Verify Telegram link</DialogTitle></DialogHeader>
        <p className="text-[13px] text-muted mb-5 leading-relaxed">Use /link in Telegram to request a code. We also send the code to your email.</p>
        <form onSubmit={linkForm.handleSubmit(handleLink)} className="flex flex-col gap-4">
          <div><label className="t-label">Email</label><input {...linkForm.register("email", { required: true })} className="t-input" /></div>
          <div><label className="t-label">Email code</label><input {...linkForm.register("code", { required: true })} className="t-input" /></div>
          <div><label className="t-label">Set password</label><input type="password" {...linkForm.register("password", { required: true })} className="t-input" /></div>
          <button type="submit" className="t-btn-primary w-full justify-center">Verify & link →</button>
        </form>
      </Dialog>
    </div>
  );
}
