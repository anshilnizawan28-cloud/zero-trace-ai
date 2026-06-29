import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Enterprise", "/enterprise"],
      ["Security", "/security"],
      ["Sample report", "/sample-report"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["Documentation", "/docs"],
      ["API", "/api-reference"],
      ["Supported file types", "/supported-files"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Zero Storage Guarantee", "/zero-storage"],
      ["Privacy", "/privacy"],
      ["FAQs", "/faq"],
      ["Customer use cases", "/use-cases"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Blog", "/blog"],
      ["Contact", "/contact"],
      ["Contact sales", "/contact?sales=1"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,1fr,1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" />
            ZeroVault
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Zero Storage AI Document Forensic Analyzer. Encrypted in-memory
            processing for banks, law firms, auditors, and government.
          </p>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            SOC 2 · ISO 27001 · GDPR · HIPAA aligned
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
              {c.title}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to as any} className="hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} ZeroVault. Analyze Documents. Never Store Them.</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/zero-storage" className="hover:text-foreground">Zero Storage</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}