import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { BookOpen, Rocket, KeyRound, Webhook, Code2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — ZeroVault" }, { name: "description", content: "Guides, tutorials, and SDKs for the ZeroVault forensic platform." }] }),
  component: Docs,
});

const SECTIONS = [
  { icon: Rocket, t: "Quickstart", d: "Run your first analysis in under 60 seconds." },
  { icon: KeyRound, t: "Authentication", d: "API keys, OAuth, SSO and bearer tokens." },
  { icon: Code2, t: "SDKs", d: "Official clients for JavaScript, Python, and Go." },
  { icon: Webhook, t: "Webhooks", d: "Stream report-completed events into your stack." },
  { icon: BookOpen, t: "Report schema", d: "TypeScript types for the Document Trust Score." },
];

function Docs() {
  return (
    <PublicPage
      eyebrow="Documentation"
      title={<>Build on the <span className="text-gradient-cyber">forensic platform</span>.</>}
      description="Production-grade APIs, SDKs, and reference architectures."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ icon: Icon, t, d }) => (
          <div key={t} className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            <Link to={"/api-reference" as any} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Read more <ArrowRight className="h-3 w-3" /></Link>
          </div>
        ))}
      </div>
    </PublicPage>
  );
}