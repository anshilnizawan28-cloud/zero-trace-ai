import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import {
  Brain, ScanText, Fingerprint, ShieldCheck, GitCompare, FileWarning,
  Lock, EyeOff, FileSearch, Award, Languages, KeyRound, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ZeroVault" },
      { name: "description", content: "Forensic AI across metadata, OCR, tampering, signatures, and the Document Trust Score." },
    ],
  }),
  component: Features,
});

const GROUPS = [
  { title: "AI forensic analysis", items: [
    { icon: Brain, t: "Executive AI summary", d: "Plain-language risk and intent overview from GPT-class reasoning." },
    { icon: Award, t: "Document Trust Score", d: "Flagship 0–100 composite of integrity, signature, tampering, and metadata." },
    { icon: FileWarning, t: "Tampering detection", d: "Edit indicators, font drift, timestamp anomalies, image manipulation." },
    { icon: FileSearch, t: "Metadata interpretation", d: "Authors, software chain, revision history, hidden comments." },
  ]},
  { title: "Content & integrity", items: [
    { icon: Fingerprint, t: "SHA-256 / SHA-512 / MD5", d: "Cryptographic hashes computed locally for chain of custody." },
    { icon: ScanText, t: "OCR & language detection", d: "Recover text from scans with confidence scores." },
    { icon: Languages, t: "Multilingual reports", d: "Detects 100+ languages and surfaces topical entities." },
    { icon: GitCompare, t: "Version comparison", d: "Redline added, deleted, and changed text across documents." },
  ]},
  { title: "Privacy & security", items: [
    { icon: EyeOff, t: "Zero Storage default", d: "Files never persist. Memory buffer is shredded post-analysis." },
    { icon: Lock, t: "AES-256 + TLS 1.3", d: "In-memory encryption and modern transport security." },
    { icon: ShieldCheck, t: "Signed chain of custody", d: "Tamper-evident report with cryptographic attestation." },
    { icon: KeyRound, t: "API & webhooks", d: "Programmatic access on Business plans and above." },
  ]},
];

function Features() {
  return (
    <PublicPage
      eyebrow="Features"
      title={<>Everything an auditor expects. <span className="text-gradient-cyber">Nothing left behind.</span></>}
      description="A complete forensic toolkit purpose-built for confidential documents."
    >
      <div className="space-y-14">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="mb-5 text-xl font-semibold tracking-tight">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                  <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
                  <div className="text-sm font-semibold">{t}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="rounded-3xl border border-border/60 bg-gradient-hero p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">See it on a real document</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Zero Storage means no file ever leaves memory.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to={"/auth" as any} search={{ mode: "signup" } as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={"/sample-report" as any} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-semibold hover:bg-accent/30">
              View sample report
            </Link>
          </div>
        </section>
      </div>
    </PublicPage>
  );
}