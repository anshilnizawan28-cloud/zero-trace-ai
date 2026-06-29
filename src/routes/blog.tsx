import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { ArrowRight, Newspaper } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — ZeroVault" }, { name: "description", content: "Forensic deep dives, product announcements, and security research." }] }),
  component: Blog,
});

const POSTS = [
  { t: "Inside the Document Trust Score", d: "How we compose integrity, signature, and tampering signals into a single number.", k: "Engineering" },
  { t: "Zero Storage, explained for procurement", d: "A plain-language deep dive your security review board will love.", k: "Security" },
  { t: "PDF tampering in the wild", d: "Five patterns we see across financial documents — and how to spot them.", k: "Research" },
  { t: "Shipping signed reports", d: "Why we sign every forensic report and how to verify the chain offline.", k: "Product" },
];

function Blog() {
  return (
    <PublicPage
      eyebrow="Blog"
      title={<>Notes from the <span className="text-gradient-cyber">forensic frontier</span>.</>}
      description="Engineering, security, and product writing from the ZeroVault team."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {POSTS.map((p) => (
          <article key={p.t} className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Newspaper className="h-3.5 w-3.5" /> {p.k}</div>
            <h2 className="mt-2 text-lg font-semibold">{p.t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Read article <ArrowRight className="h-3 w-3" /></div>
          </article>
        ))}
      </div>
    </PublicPage>
  );
}