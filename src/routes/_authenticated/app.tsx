import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Shield, FileSearch, Upload, KeyRound, Users, Receipt, Activity,
  LogOut, ShieldCheck, Sparkles, FileCheck2, Lock, Database, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Workspace · ZeroVault" }] }),
  component: WorkspaceHome,
});

type Org = { id: string; name: string };

function WorkspaceHome() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("memberships")
        .select("organizations(id, name)")
        .eq("user_id", user!.id);
      const list = (data ?? [])
        .map((m: any) => m.organizations)
        .filter(Boolean) as Org[];
      setOrgs(list);
    })();
  }, [user]);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert({ name: orgName, owner_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      // Seed a trialing subscription on the Free plan
      const { data: plan } = await supabase.from("plans").select("id").eq("tier", "free").single();
      if (plan) {
        await supabase.from("subscriptions").insert({ org_id: data.id, plan_id: plan.id, status: "trialing" });
      }
      toast.success(`Workspace "${data.name}" created.`);
      setOrgs((prev) => [...(prev ?? []), { id: data.id, name: data.name }]);
      setOrgName("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function logout() {
    await signOut();
    navigate({ to: "/auth" });
  }

  const hasOrgs = orgs && orgs.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-cyber shadow-glow">
              <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">ZeroVault</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/app" className="text-foreground">Overview</Link>
            <Link to="/analyze" className="hover:text-foreground">Analyze</Link>
            <Link to="/dashboard" className="hover:text-foreground">Reports</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium">{user?.email}</div>
              <div className="text-muted-foreground">Signed in</div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent/40"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-border/60 bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Welcome</div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hi {user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Your workspace runs on Zero Storage architecture. Documents never touch disk.</p>
            </div>
            <Link to="/analyze" className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <Upload className="h-4 w-4" /> Analyze a document
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {/* ONBOARDING / ORG */}
        {!hasOrgs && (
          <section className="glass rounded-2xl border border-border/60 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create your first workspace</h2>
                <p className="text-sm text-muted-foreground">A workspace holds your team, plan, and audit logs.</p>
              </div>
            </div>
            <form onSubmit={createOrg} className="mt-5 flex flex-wrap items-end gap-3">
              <label className="flex-1 min-w-[240px]">
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace name</div>
                <input
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Legal"
                  className="w-full rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                />
              </label>
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-gradient-cyber px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                Create workspace
              </button>
            </form>
          </section>
        )}

        {hasOrgs && (
          <section>
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your workspaces</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orgs!.map((o) => (
                <div key={o.id} className="glass rounded-xl border border-border/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-cyber text-primary-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{o.name}</div>
                      <div className="text-xs text-muted-foreground">Workspace · Free trial</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Quick actions</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard icon={FileSearch} title="Analyze document" body="Run forensic AI analysis with metadata, OCR, hashes." to="/analyze" />
            <ActionCard icon={FileCheck2} title="Verify signatures" body="Inspect every digital signature embedded in a PDF." to="/analyze" />
            <ActionCard icon={KeyRound} title="API keys" body="Generate, rotate, and disable keys for programmatic access." to="/app" disabled />
            <ActionCard icon={Receipt} title="Billing" body="Manage your plan, invoices, and usage." to="/app" disabled />
          </div>
        </section>

        {/* SECURITY POSTURE */}
        <section className="grid gap-4 lg:grid-cols-3">
          <PostureCard icon={Lock} title="Zero Storage" status="Active" detail="Documents are processed in encrypted memory and wiped on completion." tone="ok" />
          <PostureCard icon={ShieldCheck} title="Encryption" status="AES-256 · TLS 1.3" detail="In-transit and in-memory protection enforced by default." tone="ok" />
          <PostureCard icon={AlertTriangle} title="MFA" status="Recommended" detail="Enable TOTP or email OTP for an additional layer of trust." tone="warn" />
        </section>
      </main>
    </div>
  );
}

function ActionCard({
  icon: Icon, title, body, to, disabled,
}: { icon: typeof Shield; title: string; body: string; to: string; disabled?: boolean }) {
  const inner = (
    <div className={`group relative h-full rounded-2xl border border-border/60 bg-card p-5 transition ${disabled ? "opacity-60" : "hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"}`}>
      <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {disabled && <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">Coming next phase</div>}
    </div>
  );
  return disabled ? inner : <Link to={to as any}>{inner}</Link>;
}

function PostureCard({
  icon: Icon, title, status, detail, tone,
}: { icon: typeof Shield; title: string; status: string; detail: string; tone: "ok" | "warn" }) {
  return (
    <div className="glass rounded-2xl border border-border/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone === "ok" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}