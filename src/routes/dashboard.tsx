import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import {
  FileText, FileCheck2, Timer, Gauge, Coins, Activity,
  ShieldCheck, MemoryStick, Lock, Wifi, ArrowRight, AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ZeroVault" },
      { name: "description", content: "Session overview, privacy posture, and recent forensic activity." },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { icon: FileText, label: "Documents analyzed today", value: "128", trend: "+18%" },
  { icon: FileCheck2, label: "Reports generated", value: "94", trend: "+12%" },
  { icon: Timer, label: "Avg processing time", value: "3.4s", trend: "−0.6s" },
  { icon: Gauge, label: "Avg risk score", value: "Low", trend: "Stable" },
  { icon: Coins, label: "Credits remaining", value: "8,420", trend: "Plan: Enterprise" },
  { icon: Activity, label: "Active sessions", value: "3", trend: "Healthy" },
];

const SECURITY = [
  { icon: ShieldCheck, label: "Zero Storage", status: "Enabled", tone: "success" },
  { icon: MemoryStick, label: "Memory Usage", status: "412 MB · isolated", tone: "info" },
  { icon: Lock, label: "Encryption", status: "AES-256 · TLS 1.3", tone: "success" },
  { icon: Wifi, label: "Network", status: "Egress restricted", tone: "info" },
];

const RECENT = [
  { name: "Q3-loan-agreement.pdf", risk: "Medium", time: "2m ago", action: "Tampering review" },
  { name: "claim-#A8231.docx", risk: "Low", time: "14m ago", action: "Metadata audit" },
  { name: "patient-discharge.pdf", risk: "Critical", time: "32m ago", action: "Edit history" },
  { name: "vendor-contract-v4.docx", risk: "Low", time: "1h ago", action: "Compare vs v3" },
];

const riskTone: Record<string, string> = {
  Low: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/30",
  Medium: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/30",
  High: "text-destructive bg-destructive/10 border-destructive/30",
  Critical: "text-destructive bg-destructive/15 border-destructive/40",
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Operations</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Forensic dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Session-level overview. Nothing on this page is stored beyond your active session.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PrivacyBadge />
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              New analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STATS.map(({ icon: Icon, label, value, trend }) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{trend}</span>
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent analyses</h2>
              <span className="text-xs text-muted-foreground">Session only · auto-clears on sign out</span>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {RECENT.map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.action} · {r.time}</div>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${riskTone[r.risk]}`}>
                    {r.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="text-base font-semibold">Security posture</h2>
              <div className="mt-4 space-y-3">
                {SECURITY.map(({ icon: Icon, label, status }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Icon className="h-4 w-4 text-primary" /> {label}
                    </div>
                    <span className="text-xs text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-[color:var(--warning)]" />
                AI integrity notice
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                This analysis is based on available metadata, forensic indicators, and document
                structure. Exact historical edits cannot be reconstructed unless version history
                or previous document versions are available.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}