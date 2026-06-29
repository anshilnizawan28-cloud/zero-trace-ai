import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { Check, X, Sparkles, Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ZeroVault" },
      { name: "description", content: "Transparent plans for individuals, teams, and enterprises. Zero Storage on every tier." },
    ],
  }),
  component: Pricing,
});

type Tier = {
  id: string;
  name: string;
  price: string;
  period: string;
  tag?: string;
  highlight?: boolean;
  description: string;
  cta: { label: string; to: string; search?: Record<string, string> };
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "trial", name: "Free Trial", price: "$0", period: "14 days",
    description: "Kick the tires. No credit card required.",
    cta: { label: "Start free trial", to: "/auth", search: { mode: "signup" } },
    features: [
      "25 document analyses",
      "Up to 25 MB / document",
      "AI forensic report",
      "SHA-256 / SHA-512 / MD5 hashes",
      "Zero Storage by default",
      "Community support",
    ],
  },
  {
    id: "starter", name: "Starter", price: "$29", period: "per user / month",
    description: "For individual investigators and analysts.",
    cta: { label: "Start with Starter", to: "/auth", search: { mode: "signup" } },
    features: [
      "500 analyses / month",
      "Up to 100 MB / document",
      "OCR + language detection",
      "Digital signature verification",
      "Email support",
    ],
  },
  {
    id: "pro", name: "Professional", price: "$99", period: "per user / month",
    tag: "Most popular", highlight: true,
    description: "Pro toolkit for legal, audit, and compliance teams.",
    cta: { label: "Start with Pro", to: "/auth", search: { mode: "signup" } },
    features: [
      "2,500 analyses / month",
      "Up to 1 GB / document",
      "Document comparison & redline",
      "Tampering & metadata forensics",
      "Document Trust Score",
      "Priority support · 24 hr SLA",
    ],
  },
  {
    id: "business", name: "Business", price: "$299", period: "per workspace / month",
    description: "Teams of 10+ with shared workflows and SSO.",
    cta: { label: "Start with Business", to: "/auth", search: { mode: "signup" } },
    features: [
      "10,000 analyses / month",
      "Org-wide workspaces & RBAC",
      "Google & Microsoft SSO",
      "Webhooks & API keys",
      "Audit logs & exports",
      "Dedicated CSM",
    ],
  },
  {
    id: "enterprise", name: "Enterprise", price: "Custom", period: "annual",
    description: "SAML SSO, SCIM, on-prem residency, custom DPAs.",
    cta: { label: "Contact sales", to: "/contact", search: { sales: "1" } },
    features: [
      "Unlimited analyses",
      "SAML SSO + SCIM provisioning",
      "Private VPC / on-prem option",
      "SIEM streaming & long-term audit",
      "Custom DPA, BAA, SOC 2 letter",
      "99.99% SLA · 24/7 support",
    ],
  },
];

const COMPARE = [
  ["Zero Storage architecture",        true, true, true, true, true],
  ["AI forensic report",               true, true, true, true, true],
  ["Document Trust Score",             false, true, true, true, true],
  ["Digital signature verification",   false, true, true, true, true],
  ["Document comparison & redline",    false, false, true, true, true],
  ["Org workspaces & RBAC",            false, false, false, true, true],
  ["Google / Microsoft SSO",           false, false, false, true, true],
  ["SAML SSO + SCIM",                  false, false, false, false, true],
  ["Webhooks & API keys",              false, false, false, true, true],
  ["Audit log export",                 false, false, true, true, true],
  ["Private VPC / on-prem",            false, false, false, false, true],
  ["24/7 dedicated support",           false, false, false, false, true],
] as const;

function Pricing() {
  return (
    <PublicPage
      eyebrow="Pricing"
      title={<>Plans that scale with your <span className="text-gradient-cyber">privacy posture</span>.</>}
      description="Every plan ships with our Zero Storage architecture. Pick the workflow tier that matches your team."
    >
      <section className="grid gap-5 lg:grid-cols-5">
        {TIERS.map((t) => (
          <div
            key={t.id}
            className={[
              "relative flex flex-col rounded-2xl border p-6 shadow-card",
              t.highlight ? "border-primary/60 bg-card shadow-glow" : "border-border/60 bg-card",
            ].join(" ")}
          >
            {t.tag && (
              <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-cyber px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                <Sparkles className="h-3 w-3" /> {t.tag}
              </div>
            )}
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-tight">{t.price}</span>
              <span className="text-xs text-muted-foreground">{t.period}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
            <ul className="mt-5 space-y-2 text-xs">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--success)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to={t.cta.to as any}
              search={t.cta.search as any}
              className={[
                "mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                t.highlight
                  ? "bg-gradient-cyber text-primary-foreground shadow-glow hover:-translate-y-0.5"
                  : "border border-border bg-background/40 hover:bg-accent/40",
              ].join(" ")}
            >
              {t.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Compare plans</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Feature comparison</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-card/60">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feature</th>
                {TIERS.map((t) => (
                  <th key={t.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => {
                const [label, ...vals] = row as unknown as [string, ...boolean[]];
                return (
                  <tr key={label} className="border-t border-border/60">
                    <td className="px-4 py-3 text-foreground/90">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="px-4 py-3">
                        {v ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <X className="h-4 w-4 text-muted-foreground/40" />}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-border/60 bg-gradient-hero p-10 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs">
            <Building2 className="h-3.5 w-3.5 text-primary" /> Looking for procurement, security review, or custom terms?
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Talk to our enterprise team</h2>
          <Link to="/contact" search={{ sales: "1" } as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
            Contact sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicPage>
  );
}