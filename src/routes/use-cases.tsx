import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { Landmark, Scale, HeartPulse, Building2, ShieldCheck, FileSearch } from "lucide-react";

export const Route = createFileRoute("/use-cases")({
  head: () => ({ meta: [{ title: "Customer Use Cases — ZeroVault" }, { name: "description", content: "How banks, law firms, hospitals, auditors, and governments use ZeroVault." }] }),
  component: UseCases,
});

const CASES = [
  { icon: Landmark, t: "Banking & Lending", d: "Verify loan documents, detect altered statements, accelerate KYC review." },
  { icon: Scale, t: "Legal & Litigation", d: "Authenticate evidence, compare versions, build chain-of-custody dossiers." },
  { icon: HeartPulse, t: "Healthcare", d: "Inspect HIPAA-bound consent forms without ever persisting PHI." },
  { icon: Building2, t: "Government", d: "Vet RFP submissions and contracts inside an air-gapped private deployment." },
  { icon: ShieldCheck, t: "Insurance", d: "Surface tampering in claims paperwork and supporting evidence." },
  { icon: FileSearch, t: "Audit & SOC", d: "Run forensic batches across audit samples with full report export." },
];

function UseCases() {
  return (
    <PublicPage
      eyebrow="Use cases"
      title={<>Trusted across <span className="text-gradient-cyber">regulated industries</span>.</>}
      description="Pick a workflow — every plan ships with the same Zero Storage guarantee."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">{t}</div>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </PublicPage>
  );
}