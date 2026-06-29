import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-shield.jpg";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import {
  ShieldCheck, Brain, ScanText, GitCompare, Fingerprint, Lock,
  EyeOff, FileSearch, ArrowRight, Building2, Landmark, Scale,
  HeartPulse, Server, FileWarning, PlayCircle, Download,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZeroVault — Zero Storage AI Document Forensic Analyzer" },
      {
        name: "description",
        content:
          "Enterprise-grade AI forensic analysis of confidential documents with a Zero Storage architecture. Analyze documents. Never store them.",
      },
      { property: "og:title", content: "ZeroVault — Analyze Documents. Never Store Them." },
      {
        property: "og:description",
        content:
          "AI document forensics for banks, law firms, auditors, and government. Processed in encrypted memory, wiped after analysis.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: EyeOff, title: "Privacy First", body: "Default mode never persists your file. No disk writes, no shadow copies." },
  { icon: ShieldCheck, title: "Zero Storage", body: "Encrypted memory buffer is shredded the moment the report is sealed." },
  { icon: Lock, title: "Encrypted Processing", body: "AES-256 at rest in memory, TLS 1.3 in transit. Signed report chain of custody." },
  { icon: Brain, title: "AI Powered", body: "GPT-class reasoning over metadata, structure, language, and risk surface." },
  { icon: Fingerprint, title: "Digital Forensics", body: "Author, software, revision, timestamps, hashes, embedded objects." },
  { icon: ScanText, title: "OCR", body: "Scanned PDFs, images, handwriting — recovered with language detection." },
  { icon: FileWarning, title: "Tampering Detection", body: "Edit indicators, image manipulation, font drift, timestamp anomalies." },
  { icon: GitCompare, title: "Version Comparison", body: "Redline added, deleted, and changed text across documents." },
];

const CUSTOMERS = [
  { icon: Landmark, label: "Banks" },
  { icon: ShieldCheck, label: "Insurance" },
  { icon: Scale, label: "Law Firms" },
  { icon: Building2, label: "Government" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: FileSearch, label: "Audit · SOC · ISO" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 cyber-grid opacity-50" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr,0.95fr] lg:py-28">
          <div className="space-y-7">
            <PrivacyBadge />
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Analyze Confidential Documents{" "}
              <span className="text-gradient-cyber">Without Storing Them.</span>
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Enterprise-grade AI document forensic analysis with Zero&nbsp;Storage technology.
              Metadata, OCR, tampering detection and redline comparison — performed in an
              encrypted memory buffer that is wiped the instant your report is sealed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={"/auth" as any}
                search={{ mode: "signup" } as any}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={"/analyze" as any}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent/30"
              >
                <PlayCircle className="h-4 w-4" /> View Demo
              </Link>
              <Link
                to={"/sample-report" as any}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent/30"
              >
                <Download className="h-4 w-4" /> Download Sample Report
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to={"/auth" as any} search={{ mode: "signin" } as any} className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-4 pt-4">
              {[
                ["AES-256", "In-memory encryption"],
                ["TLS 1.3", "In-transit security"],
                ["0 ms", "Disk persistence"],
              ].map(([k, v]) => (
                <div key={k} className="glass rounded-xl px-4 py-3">
                  <div className="text-lg font-semibold tracking-tight">{k}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-cyber opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-glow">
              <img
                src={heroImg}
                width={1600}
                height={1200}
                alt="Encrypted documents dissolving into a forensic shield"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-4 py-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Server className="h-3.5 w-3.5 text-primary" />
                    Memory buffer · session #A8F3
                  </div>
                  <span className="text-[color:var(--success)]">Auto-wipe in 00:04</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER LOGOS */}
      <section className="border-y border-border/50 bg-card/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-6 py-6 text-muted-foreground">
          {CUSTOMERS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4" /> {label}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Forensic capability
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything an auditor expects. Nothing left behind.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for teams who can't compromise on privacy — banks, law firms, regulators,
            and security organizations.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="mb-4 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section id="security" className="relative overflow-hidden border-y border-border/60 bg-card/30">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.9fr,1.1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Processing pipeline
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From upload to secure wipe — in seconds.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Every step happens in an isolated, encrypted memory buffer. When the report
              is sealed, the buffer is shredded and the file is permanently deleted. No
              shadow copies. No backups. No exceptions.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {["Encrypted in-memory", "Cryptographic erasure", "Signed chain of custody", "OWASP-hardened API"].map((x) => (
                <div key={x} className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" /> {x}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <ProcessingPipeline />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-hero p-10 text-center sm:p-16">
          <div className="absolute inset-0 cyber-grid opacity-30" />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <PrivacyBadge />
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your most sensitive documents deserve a tool that forgets them.
            </h2>
            <p className="text-muted-foreground">
              Start a session — uploads are processed in memory and permanently deleted after analysis.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to={"/auth" as any}
                search={{ mode: "signup" } as any}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={"/pricing" as any}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-semibold hover:bg-accent/30"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
