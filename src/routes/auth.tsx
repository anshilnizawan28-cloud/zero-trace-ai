import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { Shield, Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in · ZeroVault" }] }),
  component: AuthPage,
});

function strengthScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: search.redirect ?? "/app", replace: true });
  }, [loading, user, navigate, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (forgotMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent. Check your inbox.");
        setForgotMode(false);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "microsoft") {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (r.error) throw r.error;
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  }

  const s = strengthScore(password);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][s];
  const strengthColor = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-cyan-500", "bg-emerald-500"][s];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <div className="hidden flex-col justify-between lg:flex">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-cyber shadow-glow">
                <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-semibold">ZeroVault</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Forensic Analyzer</div>
              </div>
            </Link>
            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-semibold tracking-tight">
                Analyze confidential documents — <span className="text-gradient-cyber">without storing them.</span>
              </h1>
              <p className="text-muted-foreground">
                Trusted by auditors, legal teams, and compliance officers. Encrypted in-memory processing, AES-256, TLS 1.3, and zero persistence by default.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  ["AES-256", "In-memory"],
                  ["TLS 1.3", "In-transit"],
                  ["ISO Ready", "27001 aligned"],
                  ["Zero Storage", "Default mode"],
                ].map(([k, v]) => (
                  <div key={k} className="glass rounded-xl px-4 py-3">
                    <div className="text-sm font-semibold">{k}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">SOC 2 · ISO 27001 · GDPR · HIPAA aligned</div>
          </div>

          <div className="glass rounded-2xl border border-border/60 p-8 shadow-glow">
            <div className="mb-6 lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> <span className="font-semibold">ZeroVault</span>
              </Link>
            </div>

            {!forgotMode && (
              <div className="mb-6 flex rounded-lg border border-border/60 bg-card/40 p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                      mode === m ? "bg-gradient-cyber text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-semibold tracking-tight">
              {forgotMode ? "Reset your password" : mode === "signin" ? "Welcome back" : "Start your free trial"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {forgotMode
                ? "We'll email you a secure reset link."
                : mode === "signin"
                  ? "Continue analyzing documents — never stored."
                  : "One free analysis, no card required."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && !forgotMode && (
                <Field icon={<Shield className="h-4 w-4" />} label="Full name">
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="Jane Doe"
                  />
                </Field>
              )}
              <Field icon={<Mail className="h-4 w-4" />} label="Work email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="you@company.com"
                />
              </Field>

              {!forgotMode && (
                <Field icon={<Lock className="h-4 w-4" />} label="Password">
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>
              )}

              {mode === "signup" && password && !forgotMode && (
                <div>
                  <div className="flex h-1.5 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition ${i < s ? strengthColor : "bg-border"}`} />
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Strength: {strengthLabel}</div>
                </div>
              )}

              {!forgotMode && mode === "signin" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => setForgotMode(true)} className="text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-cyber px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {forgotMode ? "Send reset link" : mode === "signin" ? "Sign in" : "Create account"}
              </button>

              {forgotMode && (
                <button type="button" onClick={() => setForgotMode(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                  Back to sign in
                </button>
              )}
            </form>

            {!forgotMode && (
              <>
                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => oauth("google")}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium hover:bg-accent/40 disabled:opacity-60"
                  >
                    <Chrome className="h-4 w-4" /> Google
                  </button>
                  <button
                    type="button"
                    onClick={() => oauth("microsoft")}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium hover:bg-accent/40 disabled:opacity-60"
                  >
                    <MicrosoftMark /> Microsoft
                  </button>
                </div>
              </>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Protected by enterprise-grade encryption. By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm focus-within:border-primary/60 focus-within:shadow-glow">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 23 23" className="h-4 w-4">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}