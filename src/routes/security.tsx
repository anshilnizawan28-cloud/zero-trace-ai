import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { Lock, ShieldCheck, MemoryStick, Wifi, KeyRound, FileCheck2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Security — ZeroVault" }, { name: "description", content: "Encryption, isolation, key management, and how Zero Storage works end-to-end." }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <PublicPage
      eyebrow="Security"
      title={<>Privacy by architecture, <span className="text-gradient-cyber">not policy.</span></>}
      description="ZeroVault's security model is reviewable, testable, and built on industry-standard primitives."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Lock, t: "AES-256", d: "Symmetric encryption of the in-memory document buffer." },
          { icon: Wifi, t: "TLS 1.3", d: "Modern transport security with forward secrecy on all endpoints." },
          { icon: MemoryStick, t: "Cryptographic erasure", d: "Buffer overwritten with zeros and released before report is sealed." },
          { icon: KeyRound, t: "Tenant-scoped KMS", d: "Per-workspace keys with rotation and audit logging." },
          { icon: ShieldCheck, t: "OWASP-hardened API", d: "Rate limiting, signed requests, strict CSP, replay protection." },
          { icon: FileCheck2, t: "Signed reports", d: "Reports include a signature chain so tampering is detectable." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <section className="mt-16 rounded-3xl border border-border/60 bg-gradient-hero p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Compliance posture</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">ZeroVault is engineered to support these frameworks. Statements and reports are available under NDA from our trust team.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {["SOC 2 Type II","ISO/IEC 27001","GDPR","HIPAA","PCI-DSS aligned","FedRAMP-ready"].map((x) => (
            <span key={x} className="rounded-full border border-border bg-card/60 px-3 py-1">{x}</span>
          ))}
        </div>
        <Link to={"/contact" as any} search={{ sales: "1" } as any} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
          Request trust package <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </PublicPage>
  );
}