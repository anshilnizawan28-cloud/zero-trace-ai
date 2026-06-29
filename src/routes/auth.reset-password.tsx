import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · ZeroVault" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <form onSubmit={submit} className="glass w-full rounded-2xl border border-border/60 p-8 shadow-glow">
          <div className="mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">ZeroVault</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>

          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">New password</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm focus-within:border-primary/60">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                required
                minLength={8}
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-cyber px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}