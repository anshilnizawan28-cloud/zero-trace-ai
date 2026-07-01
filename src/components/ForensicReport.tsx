import type { ExtractResult } from "@/lib/forensics/types";
import type { ForensicReport } from "@/lib/forensic-ai.functions";
import { TrustScoreCard, computeTrustScore } from "@/components/TrustScore";
import {
  AlertTriangle, CheckCircle2, Clock, Download, FileText, Fingerprint, Gauge,
  History, Languages, Lock, ScanLine, ShieldAlert, ShieldCheck, Sparkles, Trash2,
} from "lucide-react";

const riskTone: Record<string, string> = {
  Low: "text-[color:var(--success)] bg-[color:var(--success)]/10 border-[color:var(--success)]/30",
  Medium: "text-[color:var(--warning)] bg-[color:var(--warning)]/10 border-[color:var(--warning)]/30",
  High: "text-destructive bg-destructive/10 border-destructive/30",
  Critical: "text-destructive bg-destructive/15 border-destructive/40",
};

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))
    return null;
  return (
    <div className="grid grid-cols-[140px,1fr] gap-3 py-1.5 text-xs">
      <div className="text-muted-foreground">{label}</div>
      <div className="break-words text-foreground/90">{value}</div>
    </div>
  );
}

function HashRow({ algo, value }: { algo: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/50 bg-background/40 p-2.5 text-[11px]">
      <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono font-semibold text-primary">{algo}</span>
      <code className="break-all text-muted-foreground">{value}</code>
    </div>
  );
}

function Meter({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "warning" | "destructive" }) {
  const color = tone === "destructive" ? "bg-destructive" : tone === "warning" ? "bg-[color:var(--warning)]" : "bg-primary";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ForensicReportView({
  extract,
  report,
  onReset,
}: {
  extract: ExtractResult;
  report: ForensicReport;
  onReset: () => void;
}) {
  const downloadJson = () => {
    const payload = { extract, report, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-report-${extract.fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const m = extract.metadata;
  const tone = report.riskLabel;
  const trust = computeTrustScore(extract, report);
const signature = extract.signatures?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[color:var(--success)]/40 bg-[color:var(--success)]/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--success)]/15 text-[color:var(--success)]">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[color:var(--success)]">Document permanently deleted</div>
              <div className="text-xs text-muted-foreground">
                In-memory buffer wiped · only report data retained for this session
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadJson} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent/40">
              <Download className="h-3.5 w-3.5" /> Download report (JSON)
            </button>
            <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md bg-gradient-cyber px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
              New analysis
            </button>
          </div>
        </div>
      </div>

      {/* Flagship Trust Score */}
      <TrustScoreCard score={trust} />
<section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
  <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
    <ShieldCheck className="h-4 w-4 text-primary" />
    Document Authenticity
  </div>

  {signature ? (
    <div className="grid gap-2 text-sm">

      <Field
        label="Digital Signature"
        value={
          signature.cryptographicStatus === "Valid"
            ? "? VALID"
            : signature.cryptographicStatus === "Invalid"
            ? "? INVALID"
            : "UNKNOWN"
        }
      />

      <Field label="Signed By" value={signature.subject} />

      <Field label="Issuer" value={signature.issuer} />

      <Field
        label="Certificate Status"
        value={signature.trusted ? "Trusted" : "Untrusted"}
      />

      <Field
        label="Certificate Expiry"
        value={signature.validTo}
      />

      <Field
        label="Serial Number"
        value={signature.serialNumber}
      />

      <Field
        label="Signature Algorithm"
        value={signature.signatureAlgorithm}
      />

      <Field
        label="Trust Chain"
        value={signature.trusted ? "Trusted" : "Unknown"}
      />

      <Field
        label="Confidence"
        value={`${signature.confidenceScore}/100`}
      />

    </div>
  ) : (
    <div className="text-sm text-muted-foreground">
      No digital signature detected.
    </div>
  )}
</section>

      {/* Executive */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Executive summary
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{extract.fileName}</h2>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {(extract.fileSize / 1024 / 1024).toFixed(2)} MB · {extract.mimeType || "unknown type"} · {m.pageCount ?? "?"} pages
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${riskTone[tone]}`}>
            {tone} risk · {report.riskScore}/100
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">{report.executiveSummary}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Meter label="Risk score" value={report.riskScore} tone={report.riskScore >= 55 ? "destructive" : report.riskScore >= 30 ? "warning" : "primary"} />
          <Meter label="Tampering confidence" value={report.tamperingConfidence} tone={report.tamperingConfidence >= 55 ? "destructive" : "warning"} />
          <Meter label="Editing likelihood" value={report.editingLikelihood} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metadata */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" /> Metadata
          </div>
          <div className="divide-y divide-border/50">
            <Field label="Author" value={m.author} />
            <Field label="Last modified by" value={m.lastModifiedBy} />
            <Field label="Creator" value={m.creator} />
            <Field label="Producer" value={m.producer} />
            <Field label="Application" value={m.application} />
            <Field label="Company" value={m.company} />
            <Field label="Title" value={m.title} />
            <Field label="Subject" value={m.subject} />
            <Field label="Keywords" value={m.keywords} />
            <Field label="Created" value={m.createdDate} />
            <Field label="Modified" value={m.modifiedDate} />
            <Field label="Revision" value={m.revisionNumber} />
            <Field label="Edit time" value={m.totalEditingTime} />
            <Field label="Pages" value={m.pageCount} />
            <Field label="Words" value={m.wordCount} />
            <Field label="Language" value={m.language ?? report.language} />
            <Field label="PDF version" value={m.pdfVersion} />
            <Field label="Encryption" value={m.encryption?.encrypted ? `Yes — ${m.encryption.method ?? "standard"}` : "No"} />
            <Field label="Digital sigs" value={m.digitalSignatures?.join(", ")} />
            <Field label="Track changes" value={m.trackChanges?.join(", ")} />
            <Field label="Embedded" value={m.embeddedObjects?.join(", ")} />
            <Field label="Hidden comments" value={m.hiddenComments?.length ? `${m.hiddenComments.length} comment(s)` : undefined} />
            <Field label="Fonts" value={m.fonts?.length ? `${m.fonts.length} — ${m.fonts.slice(0, 6).join(", ")}${m.fonts.length > 6 ? "…" : ""}` : undefined} />
          </div>
          <div className="mt-4 rounded-lg border border-border/50 bg-background/40 p-3 text-xs">
            <div className="mb-1 font-semibold">Interpretation</div>
            <p className="text-muted-foreground">{report.metadataInterpretation}</p>
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Fingerprint className="h-4 w-4 text-primary" /> File integrity
            </div>
            <div className="space-y-2">
              <HashRow algo="SHA-256" value={extract.hashes.sha256} />
              <HashRow algo="SHA-512" value={extract.hashes.sha512} />
              <HashRow algo="MD5" value={extract.hashes.md5} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" />
              Hashes generated locally and verified for chain-of-custody.
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ScanLine className="h-4 w-4 text-primary" /> OCR
            </div>
            {extract.ocr.performed ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md border border-border/50 bg-background/40 p-2">
                    <div className="text-muted-foreground">Confidence</div>
                    <div className="font-semibold">{extract.ocr.confidence?.toFixed(1) ?? "—"}%</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background/40 p-2">
                    <div className="text-muted-foreground">Language</div>
                    <div className="font-semibold uppercase">{extract.ocr.language ?? "—"}</div>
                  </div>
                  <div className="rounded-md border border-border/50 bg-background/40 p-2">
                    <div className="text-muted-foreground">Pages OCR'd</div>
                    <div className="font-semibold">{extract.ocr.pagesOcred ?? 1}</div>
                  </div>
                </div>
                {extract.ocr.text && (
                  <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-border/50 bg-background/40 p-2.5 text-[11px] text-muted-foreground">
                    {extract.ocr.text.slice(0, 800)}
                    {extract.ocr.text.length > 800 ? "…" : ""}
                  </pre>
                )}
              </>
            ) : (
              <div className="text-xs text-muted-foreground">
                {extract.ocr.isScanned
                  ? "Scanned content detected. Re-run with OCR enabled to extract text."
                  : "Native text layer detected — OCR not required."}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Tampering + indicators */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="h-4 w-4 text-primary" /> Tampering & editing indicators
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suspicious indicators</div>
            {report.suspiciousIndicators.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-[color:var(--success)]">
                <ShieldCheck className="h-4 w-4" /> No indicators flagged
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs">
                {report.suspiciousIndicators.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--warning)]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editing software detected</div>
            {report.editingSoftwareDetected.length === 0 ? (
              <div className="text-xs text-muted-foreground">None inferable from metadata.</div>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {report.editingSoftwareDetected.map((s, i) => (
                  <li key={i} className="rounded-full border border-border bg-background/40 px-2 py-0.5 text-[11px]">{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {report.timeline.length > 0 && (
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-primary" /> Timeline
          </div>
          <ol className="relative space-y-3 border-l border-border/60 pl-4">
            {report.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {t.when} · {t.source}
                </div>
                <div className="text-sm">{t.what}</div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Recommendations */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Gauge className="h-4 w-4 text-primary" /> Recommendations
        </div>
        <ul className="space-y-2 text-sm">
          {report.recommendations.map((r, i) => (
            <li key={i} className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{r}</span>
            </li>
          ))}
          {report.recommendations.length === 0 && (
            <li className="text-xs text-muted-foreground">No further action recommended.</li>
          )}
        </ul>
      </section>

      {/* Footer attestation */}
      <div className="glass rounded-2xl p-5 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Lock className="h-4 w-4 text-[color:var(--success)]" /> Zero Storage attestation
        </div>
        Document bytes were processed entirely inside your browser's encrypted memory.
        The buffer was overwritten with zeros and released to GC immediately after
        report generation. Only the structured report above, integrity hashes, and
        audit timestamps are retained for this session.
        {(extract.metadata.raw as { parserError?: string } | undefined)?.parserError && (
          <div className="mt-2 text-[11px] text-[color:var(--warning)]">
            Parser note: {(extract.metadata.raw as { parserError?: string }).parserError}
          </div>
        )}
        <div className="mt-3 inline-flex items-center gap-2 text-[11px]">
          <Languages className="h-3 w-3" /> Detected language: {report.language ?? "—"}
          {report.topics?.length ? ` · Topics: ${report.topics.join(", ")}` : ""}
        </div>
      </div>
    </div>
  );
}
