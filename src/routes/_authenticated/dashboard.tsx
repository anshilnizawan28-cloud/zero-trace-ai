import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import {
  Activity, ArrowRight, Coins, CreditCard, FileSearch, FileText,
  GitCompare, KeyRound, LogOut, Receipt, ShieldCheck, Sparkles,
  FileCheck2, Trash2, MemoryStick,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · ZeroVault" }] }),
  component: Dashboard,
});

type PlanInfo = { name: string; tier: string; status: string };
type Recent = { id: string; file_name: string; trust_score: number | null; status: string; created_at: string };

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [credits, setCredits] = useState({ used: 0, total: 0 });
  const [docs, setDocs] = useState({ today: 0, total: 0 });
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: m } = await supabase
          .from("memberships").select("org_id").eq("user_id", user.id).limit(1).maybeSingle();
        if (!m?.org_id) {
          setPlan({ name: "Free Trial", tier: "trial", status: "trialing" });
          return;
        }
        const orgId = m.org_id;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, plans(name, tier)")
          .eq("org_id", orgId)
          .maybeSingle();
        const p = (sub?.plans as { name?: string; tier?: string } | null) ?? null;
        setPlan({
          name: p?.name ?? "Free Trial",
          tier: p?.tier ?? "trial",
          status: sub?.status ?? "trialing",
        });

        const { data: usage } = await supabase
          .rpc("get_usage_snapshot", { _org: orgId })
          .maybeSingle();
        if (usage) {
          setCredits({ used: usage.credits_used ?? 0, total: usage.monthly_limit ?? 0 });
          setDocs((d) => ({ ...d, today: usage.documents_analyzed ?? 0 }));
        }

        const { count } = await supabase
          .from("document_analysis")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId);
        setDocs((d) => ({ today: d.today, total: count ?? 0 }));

        const { data: rows } = await supabase
          .from("document_analysis")
          .select("id, file_name, trust_score, status, created_at")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(10);
        setRecent((rows as Recent[]) ?? []);
      } catch {
        setPlan({ name: "Free Trial", tier: "trial", status: "trialing" });
      }
    })();
  }, [user]);

  const remaining = Math.max(0, credits.total - credits.used);
  const firstName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Workspace</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your dashboard runs on Zero Storage. Nothing on this page persists document content.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PrivacyBadge compact />
            <Link to={"/analyze" as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Analyze document <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-accent/40 sm:inline-flex"
              title="Sign out">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={CreditCard} label="Current plan" value={plan?.name ?? "…"}
            sub={plan?.status === "trialing" ? "14-day free trial" : `Status: ${plan?.status ?? "—"}`}
            cta={{ to: "/pricing", label: "Upgrade" }} highlight />
          <SummaryCard icon={Coins} label="Remaining credits" value={remaining.toLocaleString()}
            sub={`${credits.used} of ${credits.total} used this cycle`} meter={credits.total ? (credits.used / credits.total) * 100 : 0} />
          <SummaryCard icon={FileText} label="Documents analyzed" value={docs.total.toLocaleString()} sub={`${docs.today} today`} />
          <SummaryCard icon={ShieldCheck} label="Zero Storage status" value="Active" sub="Memory-only · Auto-wipe enabled" tone="success" />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <ActionCard icon={FileSearch} title="Analyze Document" to="/analyze" desc="Forensic AI on a single document." />
            <ActionCard icon={GitCompare} title="Compare Documents" to="/analyze" desc="Redline two versions side by side." />
            <ActionCard icon={FileCheck2} title="Verify Digital Signature" to="/analyze" desc="Inspect PKCS#7 signatures & chains." />
            <ActionCard icon={Receipt} title="Reports" to="/dashboard" desc="Session reports & audit logs." />
            <ActionCard icon={CreditCard} title="Billing" to="/pricing" desc="Plans, invoices, payment methods." />
            <ActionCard icon={KeyRound} title="API Keys" to="/api-reference" desc="Generate, rotate, revoke keys." />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent analyses</h2>
              <span className="text-xs text-muted-foreground">Session only · auto-clears on sign out</span>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {recent.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No analyses yet. Run your first document to see it here.
                </div>
              )}
              {recent.map((r) => {
                const ts = r.trust_score ?? 0;
                const band = ts >= 85 ? "Verified" : ts >= 65 ? "Trusted" : ts >= 40 ? "Caution" : "Untrusted";
                const when = new Date(r.created_at).toLocaleString();
                return (
                  <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                      <div>
                        <div className="text-sm font-medium">{r.file_name}</div>
                        <div className="text-xs text-muted-foreground">Trust {ts} · {r.status} · {when}</div>
                      </div>
                    </div>
                    <span className={[
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      band === "Verified" ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                      : band === "Trusted" ? "border-primary/40 bg-primary/10 text-primary"
                      : band === "Caution" ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning)]"
                      : "border-destructive/40 bg-destructive/10 text-destructive",
                    ].join(" ")}>{band}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="text-base font-semibold">Security posture</h2>
              <div className="mt-4 space-y-3 text-sm">
                <PostureRow icon={Trash2} label="Zero Storage" status="Enabled" />
                <PostureRow icon={MemoryStick} label="Memory buffer" status="Isolated" />
                <PostureRow icon={Activity} label="Session" status="Healthy" />
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Tips</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Invite teammates to share audit logs and report exports. Upgrade to Business for SSO, API keys, and webhooks.
              </p>
              <Link to={"/pricing" as any} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                See plans <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, cta, meter, highlight, tone }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string;
  cta?: { to: string; label: string }; meter?: number; highlight?: boolean; tone?: "success";
}) {
  return (
    <div className={[
      "relative overflow-hidden rounded-2xl border p-5 shadow-card",
      highlight ? "border-primary/40 bg-card shadow-glow" : "border-border/60 bg-card",
    ].join(" ")}>
      <div className="flex items-center justify-between">
        <div className={[
          "grid h-9 w-9 place-items-center rounded-lg",
          tone === "success" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-primary/15 text-primary",
        ].join(" ")}><Icon className="h-4 w-4" /></div>
        {cta && (
          <Link to={cta.to as any} className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline">{cta.label} →</Link>
        )}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground/80">{sub}</div>}
      {typeof meter === "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-cyber transition-all" style={{ width: `${Math.min(100, meter)}%` }} />
        </div>
      )}
    </div>
  );
}

function ActionCard({ icon: Icon, title, desc, to }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; to: string }) {
  return (
    <Link to={to as any} className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
      <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}

function PostureRow({ icon: Icon, label, status }: { icon: React.ComponentType<{ className?: string }>; label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
      <div className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-primary" /> {label}</div>
      <span className="text-xs text-[color:var(--success)]">{status}</span>
    </div>
  );
}
