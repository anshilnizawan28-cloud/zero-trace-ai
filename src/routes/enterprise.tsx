import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { Building2, ShieldCheck, KeyRound, Network, Server, FileCheck2, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/enterprise")({
  head: () => ({ meta: [{ title: "Enterprise — ZeroVault" }, { name: "description", content: "SAML SSO, SCIM, private deployment, custom DPAs and 24/7 support." }] }),
  component: Enterprise,
});

const PILLARS = [
  { icon: ShieldCheck, t: "Privacy by design", d: "Zero Storage architecture verified by independent attestation." },
  { icon: KeyRound, t: "Identity & SSO", d: "SAML 2.0, OIDC, SCIM 2.0 provisioning, MFA enforcement." },
  { icon: Server, t: "Private deployment", d: "Dedicated VPC, regional residency, optional on-prem appliance." },
  { icon: Network, t: "SIEM streaming", d: "Audit logs streamed to Splunk, Datadog, Elastic, or S3." },
  { icon: FileCheck2, t: "Custom DPA & BAA", d: "Tailored contracts, SOC 2 report, HIPAA BAA, ISO 27001 statement." },
  { icon: Users, t: "White-glove support", d: "Named CSM, 99.99% SLA, 24/7 incident response." },
];

function Enterprise() {
  return (
    <PublicPage
      eyebrow="Enterprise"
      title={<>Built for the world's <span className="text-gradient-cyber">most regulated teams</span>.</>}
      description="Banks, governments, hospital systems, and Am Law 100 firms deploy ZeroVault inside their own perimeter."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map(({ icon: Icon, t, d }) => (
          <div key={t} className="glass rounded-2xl p-6">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <section className="mt-16 grid gap-6 rounded-3xl border border-border/60 bg-card p-8 lg:grid-cols-[1.2fr,1fr]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Building2 className="h-3.5 w-3.5" /> Procurement-ready</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Everything your security team will ask for</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {["SOC 2 Type II","ISO/IEC 27001","GDPR / UK GDPR","HIPAA BAA","PCI-DSS aligned","FedRAMP-ready","Pen test letter","Vulnerability disclosure"].map((x) => (
              <li key={x} className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[color:var(--success)]" /> {x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-6">
          <div className="text-sm font-semibold">Talk to enterprise</div>
          <p className="mt-1 text-xs text-muted-foreground">Custom pricing, security review, pilot deployment.</p>
          <Link to={"/contact" as any} search={{ sales: "1" } as any} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-cyber px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            Contact sales <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicPage>
  );
}