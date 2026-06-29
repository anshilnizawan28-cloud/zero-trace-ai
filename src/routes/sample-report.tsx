import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { TrustScoreCard, type TrustScore } from "@/components/TrustScore";
import { Download, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/sample-report")({
  head: () => ({ meta: [{ title: "Sample Report — ZeroVault" }, { name: "description", content: "A redacted example of a ZeroVault forensic report and Document Trust Score." }] }),
  component: SampleReport,
});

const SAMPLE: TrustScore = {
  overall: 72, band: "Trusted",
  integrity: 100, signatureStatus: "Valid", tamperingRisk: 24,
  metadataConsistency: 88, aiConfidence: 81, certificateTrust: "Trusted CA",
};

function SampleReport() {
  function download() {
    const blob = new Blob([JSON.stringify({ sample: true, trust: SAMPLE }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zerovault-sample-report.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <PublicPage
      eyebrow="Sample report"
      title={<>A redacted example of a <span className="text-gradient-cyber">ZeroVault forensic report</span>.</>}
      description="Every report leads with the Document Trust Score and unpacks integrity, signatures, tampering signals, OCR, and recommendations."
    >
      <div className="space-y-6">
        <TrustScoreCard score={SAMPLE} />
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          <div className="text-sm font-semibold text-foreground">Executive summary</div>
          <p className="mt-2">Document originated in Microsoft Word 365, digitally signed with a publicly-trusted certificate chain. Two minor revisions detected with consistent author metadata. No tampering indicators above noise floor.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-semibold hover:bg-accent/40">
            <Download className="h-4 w-4" /> Download sample (JSON)
          </button>
          <Link to={"/auth" as any} search={{ mode: "signup" } as any} className="inline-flex items-center gap-2 rounded-lg bg-gradient-cyber px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            Run your own analysis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PublicPage>
  );
}