import { createFileRoute, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { PublicPage } from "@/components/PublicPage";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Building2, Send } from "lucide-react";

const searchSchema = z.object({ sales: z.string().optional() });

export const Route = createFileRoute("/contact")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Contact — ZeroVault" }, { name: "description", content: "Reach the ZeroVault team for sales, security, and support." }] }),
  component: Contact,
});

function Contact() {
  const { sales } = useSearch({ from: "/contact" });
  const [type, setType] = useState<"sales" | "support" | "security">(sales ? "sales" : "sales");
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Message sent. Our team will reply within one business day.");
      (e.target as HTMLFormElement).reset();
    }, 700);
  }

  return (
    <PublicPage
      eyebrow={sales ? "Contact sales" : "Contact"}
      title={<>Talk to a <span className="text-gradient-cyber">human</span>.</>}
      description="Sales, security review, partnerships, or support — pick a queue and we'll route you."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-card/40 p-1 text-xs font-semibold">
            {(["sales","support","security"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`rounded-md px-3 py-2 capitalize transition ${type === t ? "bg-gradient-cyber text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Full name" required />
            <Input label="Work email" type="email" required />
            <Input label="Company" required />
            <Input label="Team size" />
          </div>
          <label className="block">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</div>
            <textarea rows={5} required className="w-full rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60" placeholder="What are you analyzing?" />
          </label>
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-cyber px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
            <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}
          </button>
        </form>
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4 text-primary" /> Enterprise</div>
            <p className="mt-2 text-xs text-muted-foreground">SAML SSO, SCIM, private deployment, custom DPAs.</p>
            <a href="mailto:sales@zerovault.io" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Mail className="h-3.5 w-3.5" /> sales@zerovault.io</a>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">Security disclosures</div>
            <p className="mt-2 text-xs text-muted-foreground">Report a vulnerability via our coordinated disclosure program.</p>
            <a href="mailto:security@zerovault.io" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Mail className="h-3.5 w-3.5" /> security@zerovault.io</a>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}

function Input({ label, type = "text", required }: { label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}{required ? " *" : ""}</div>
      <input type={type} required={required} className="w-full rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm outline-none focus:border-primary/60" />
    </label>
  );
}