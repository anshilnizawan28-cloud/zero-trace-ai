import type { ExtractResult } from "@/lib/forensics/types";
import type { ForensicReport } from "@/lib/forensic-ai.functions";
import {
  Award, BadgeCheck, FileCheck2, Fingerprint, ScanLine, ShieldAlert,
  ShieldCheck, Sparkles,
} from "lucide-react";

export type TrustScore = {
  overall: number;
  band: "Verified" | "Trusted" | "Caution" | "Untrusted";
  integrity: number;
  signatureStatus: "Valid" | "Invalid" | "Unsigned";
  tamperingRisk: number;
  metadataConsistency: number;
  aiConfidence: number;
  certificateTrust: "Trusted CA" | "Self-signed" | "Untrusted" | "N/A";
};

export function computeTrustScore(extract: ExtractResult, report: ForensicReport): TrustScore {
  const integrity = extract.hashes.sha256 ? 100 : 0;
  const sigs = extract.metadata.digitalSignatures ?? [];
  const signatureStatus: TrustScore["signatureStatus"] = sigs.length
    ? sigs.some((s) => /invalid|broken|fail/i.test(s)) ? "Invalid" : "Valid"
    : "Unsigned";

  const tamperingRisk = report.tamperingConfidence;
  const metaPenalties =
    (report.suspiciousIndicators?.length ?? 0) * 8 +
    (extract.metadata.trackChanges?.length ? 10 : 0) +
    (extract.metadata.hiddenComments?.length ? 8 : 0);
  const metadataConsistency = Math.max(0, 100 - metaPenalties);

  const aiConfidence = Math.max(40, 100 - Math.abs(50 - report.riskScore));
  const certificateTrust: TrustScore["certificateTrust"] =
    signatureStatus === "Unsigned" ? "N/A"
    : signatureStatus === "Invalid" ? "Untrusted"
    : sigs.some((s) => /self/i.test(s)) ? "Self-signed" : "Trusted CA";

  const sigBoost = signatureStatus === "Valid" ? 10 : signatureStatus === "Invalid" ? -30 : 0;
  const overallRaw =
    integrity * 0.20 +
    (100 - tamperingRisk) * 0.30 +
    metadataConsistency * 0.20 +
    aiConfidence * 0.20 +
    (signatureStatus === "Valid" ? 100 : signatureStatus === "Unsigned" ? 60 : 0) * 0.10 +
    sigBoost;
  const overall = Math.max(0, Math.min(100, Math.round(overallRaw)));

  const band: TrustScore["band"] =
    overall >= 85 ? "Verified" :
    overall >= 65 ? "Trusted" :
    overall >= 40 ? "Caution" : "Untrusted";

  return {
    overall, band, integrity, signatureStatus, tamperingRisk,
    metadataConsistency, aiConfidence, certificateTrust,
  };
}

const BAND_TONE: Record<TrustScore["band"], { ring: string; text: string; bg: string; chip: string }> = {
  Verified:  { ring: "stroke-[color:var(--success)]", text: "text-[color:var(--success)]", bg: "bg-[color:var(--success)]/10",  chip: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/40" },
  Trusted:   { ring: "stroke-primary",                text: "text-primary",                bg: "bg-primary/10",                chip: "bg-primary/15 text-primary border-primary/40" },
  Caution:   { ring: "stroke-[color:var(--warning)]", text: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/10", chip: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/40" },
  Untrusted: { ring: "stroke-destructive",            text: "text-destructive",            bg: "bg-destructive/10",            chip: "bg-destructive/15 text-destructive border-destructive/40" },
};

function Bar({ label, value, icon: Icon, suffix }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; suffix?: string }) {
  const tone = value >= 75 ? "bg-[color:var(--success)]" : value >= 50 ? "bg-primary" : value >= 30 ? "bg-[color:var(--warning)]" : "bg-destructive";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="font-mono font-semibold tabular-nums">{value}{suffix ?? "/100"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function TrustScoreCard({ score, compact = false }: { score: TrustScore; compact?: boolean }) {
  const tone = BAND_TONE[score.band];
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score.overall / 100) * circumference;

  return (
    <section className={`relative overflow-hidden rounded-2xl border border-border/60 ${tone.bg} p-6 shadow-card`}>
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="relative flex flex-wrap items-center gap-6">
        <div className="relative grid place-items-center">
          <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="44" className="fill-none stroke-border" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="44"
              className={`fill-none ${tone.ring} transition-all`}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className={`font-mono text-3xl font-bold tabular-nums ${tone.text}`}>{score.overall}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trust Score</div>
            </div>
          </div>
        </div>
        <div className="min-w-[200px] flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Award className={`h-4 w-4 ${tone.text}`} />
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Document Trust Score</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${tone.chip}`}>
              <BadgeCheck className="h-3.5 w-3.5" /> {score.band}
            </span>
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
              Signature: {score.signatureStatus}
            </span>
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
              Certificate: {score.certificateTrust}
            </span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
            Weighted score derived from integrity hashes, signature validity, metadata
            consistency, tampering signals, and AI confidence.
          </p>
        </div>
      </div>

      {!compact && (
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Bar label="Integrity"            value={score.integrity}            icon={Fingerprint} />
          <Bar label="Tampering risk"       value={score.tamperingRisk}        icon={ShieldAlert} />
          <Bar label="Metadata consistency" value={score.metadataConsistency} icon={FileCheck2} />
          <Bar label="AI confidence"        value={score.aiConfidence}         icon={ScanLine} />
          <div className="rounded-lg border border-border/50 bg-background/40 px-3 py-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Signature
              </span>
              <span className="font-mono text-[11px] font-semibold">{score.signatureStatus}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{score.certificateTrust}</div>
          </div>
        </div>
      )}
    </section>
  );
}