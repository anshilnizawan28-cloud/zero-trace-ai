import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import { ShieldCheck, Trash2, Server, Lock } from "lucide-react";

export const Route = createFileRoute("/zero-storage")({
  head: () => ({ meta: [{ title: "Zero Storage Guarantee — ZeroVault" }, { name: "description", content: "What Zero Storage means, what we never persist, and how it's enforced." }] }),
  component: ZeroStorage,
});

function ZeroStorage() {
  return (
    <PublicPage
      eyebrow="Zero Storage Guarantee"
      title={<>The default mode <span className="text-gradient-cyber">never persists your document.</span></>}
      description="Documents are processed inside an encrypted memory buffer that is cryptographically erased the moment your report is sealed."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
        <div className="space-y-4">
          {[
            { icon: ShieldCheck, t: "No disk writes", d: "Files never touch persistent storage on our infrastructure." },
            { icon: Trash2, t: "Auto-wipe attestation", d: "Buffer is overwritten with zeros and released to GC after analysis." },
            { icon: Lock, t: "Memory isolation", d: "Each session runs in an isolated, encrypted process boundary." },
            { icon: Server, t: "No shadow copies", d: "No backups, no logs of file bytes, no replication of payloads." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" /> {t}</div>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5"><ProcessingPipeline /></div>
      </div>
    </PublicPage>
  );
}