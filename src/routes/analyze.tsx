import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  UploadCloud, FileText, X, Trash2, ShieldCheck, Brain, Hash, ScanText, Clock,
  AlertTriangle, Loader2,
} from "lucide-react";
import { analyzeFile, type ProgressEvent } from "@/lib/forensics/analyze";
import type { ExtractResult } from "@/lib/forensics/types";
import { runForensicAnalysis, type ForensicReport } from "@/lib/forensic-ai.functions";
import { ForensicReportView } from "@/components/ForensicReport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { computeTrustScore } from "@/components/TrustScore";
import { toast } from "sonner";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a Document — ZeroVault" },
      { name: "description", content: "Securely analyze a document in encrypted memory. Permanently deleted after analysis." },
    ],
  }),
  component: Analyze,
});

const SUPPORTED = "PDF · DOC · DOCX · PPT · PPTX · XLSX · TXT · RTF · ODT · JPEG · PNG · TIFF";

function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [retention, setRetention] = useState("immediate");
  const [progress, setProgress] = useState<{ pct: number; label: string } | null>(null);
  const [extract, setExtract] = useState<ExtractResult | null>(null);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const callAi = useServerFn(runForensicAnalysis);
  const { user } = useAuth();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void start(f);
  }, []);

  const start = async (f: File) => {
    setFile(f);
    setExtract(null);
    setReport(null);
    setError(null);
    setRunning(true);
    setProgress({ pct: 5, label: "Buffering file in encrypted memory" });
    const startedAt = Date.now();
    try {
      // Pre-flight: resolve org + credit check
      let orgId: string | null = null;
      if (user) {
        const { data: m } = await supabase
          .from("memberships").select("org_id").eq("user_id", user.id).limit(1).maybeSingle();
        orgId = m?.org_id ?? null;
        if (orgId) {
          const { data: usage } = await supabase
            .rpc("get_usage_snapshot", { _org: orgId }).maybeSingle();
          if (usage && (usage.credits_remaining ?? 0) <= 0) {
            throw new Error("No credits remaining. Upgrade your subscription.");
          }
        }
      }

      const labelMap: Record<ProgressEvent["phase"], string> = {
        buffer: "Buffering file in encrypted memory",
        hash: "Generating SHA-256, SHA-512, MD5",
        parse: "Extracting metadata & text",
        ocr: "OCR scan",
        wipe: "Wiping memory buffer",
      };
      const ex = await analyzeFile(f, (e) => {
        setProgress({ pct: e.pct, label: ("label" in e && e.label) || labelMap[e.phase] });
      });
      setExtract(ex);
      setProgress({ pct: 100, label: "Running AI forensic analysis" });
      const r = await callAi({
  data: {
    fileName: ex.fileName,
    fileSize: ex.fileSize,
    mimeType: ex.mimeType,
    metadata: ex.metadata as Record<string, unknown>,
    textExcerpt: ex.textExcerpt,
    fullTextLength: ex.fullTextLength,
    ocr: ex.ocr,
    hashes: ex.hashes,

    signatures: ex.signatures ?? [],
  },
});
      setReport(r);

      // Persist analysis + findings + report + usage in one transaction
      if (orgId) {
        try {
          const trust = computeTrustScore(ex, r);
          const findings = [
            ...(r.suspiciousIndicators ?? []).map((t) => ({
              category: "tampering", severity: "high", title: t, description: t,
            })),
            ...(r.editingSoftwareDetected ?? []).map((t) => ({
              category: "editing-software", severity: "info", title: t, description: t,
            })),
            ...(r.recommendations ?? []).map((t) => ({
              category: "recommendation", severity: "info", title: t, description: t,
            })),
          ];
          const payload = {
            org_id: orgId,
            file_name: ex.fileName,
            file_size: ex.fileSize,
            mime_type: ex.mimeType,
            sha256_hash: ex.hashes.sha256,
            md5_hash: ex.hashes.md5,
            trust_score: trust.overall,
            risk_score: r.riskScore,
            risk_label: r.riskLabel,
            tampering_confidence: r.tamperingConfidence,
            ai_summary: r.executiveSummary,
            forensic_report: r,
            metadata: ex.metadata,
            signature_verified: trust.signatureStatus === "Valid",
            ocr_used: !!ex.ocr?.performed,
            watermark_detected: false,
            tampering_detected: (r.suspiciousIndicators?.length ?? 0) > 0,
            processing_time_ms: Date.now() - startedAt,
            findings,
          };
          const { error: rpcErr } = await supabase.rpc("persist_analysis", { p_payload: payload as never });
          if (rpcErr) {
            if (/NO_CREDITS/.test(rpcErr.message)) {
              toast.error("No credits remaining. Upgrade your subscription.");
            } else {
              toast.error(`Report not saved: ${rpcErr.message}`);
            }
          } else {
            toast.success("Report saved to your workspace.");
          }
        } catch (persistErr) {
          toast.error(`Report not saved: ${(persistErr as Error).message}`);
        }
      }
    } catch (err) {
      setError((err as Error).message || "Analysis failed");
    } finally {
      setRunning(false);
      setProgress(null);
      // Drop reference to original File object
      setFile(null);
    }
  };

  const reset = () => {
    setExtract(null); setReport(null); setError(null); setFile(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Session</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Analyze a document</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your uploaded documents are processed securely in memory and permanently deleted after analysis.
            </p>
          </div>
          <PrivacyBadge />
        </div>

        {report && extract ? (
          <div className="mt-8">
            <ForensicReportView extract={extract} report={report} onReset={reset} />
          </div>
        ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          {/* Upload */}
          <section className="space-y-6">
            <div
              onDragOver={(e) => { if (!running) { e.preventDefault(); setDrag(true); } }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => !running && inputRef.current?.click()}
              className={[
                "relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all",
                running ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                drag ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-card/40 hover:border-primary/50 hover:bg-card",
              ].join(" ")}
            >
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-cyber text-primary-foreground shadow-glow animate-float">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div className="text-lg font-semibold">{running ? "Analyzing securely…" : "Drop a document to analyze"}</div>
                <div className="text-xs text-muted-foreground">{SUPPORTED}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground/80">Max 2 GB · No copy of your file will be stored</div>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv,.json,.md,.rtf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void start(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {(file || running) && (
              <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-glow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{file?.name ?? extract?.fileName ?? "Document"}</div>
                      <div className="text-xs text-muted-foreground">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ` : ""}
                        {progress?.label ?? "Queued"}
                      </div>
                    </div>
                  </div>
                  {!running && (
                    <button
                      onClick={() => setFile(null)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {progress && (
                  <div className="mt-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-cyber transition-all" style={{ width: `${progress.pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{progress.label}</span><span>{progress.pct}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">Analysis failed</div>
                  <div className="text-xs opacity-90">{error}</div>
                </div>
              </div>
            )}

            {/* Retention */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Retention</h2>
                  <p className="text-xs text-muted-foreground">Enterprise default: delete immediately.</p>
                </div>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  ["immediate", "Delete immediately"],
                  ["report", "Delete after report download"],
                  ["1h", "Delete after 1 hour"],
                  ["24h", "Delete after 24 hours"],
                  ["7d", "Delete after 7 days"],
                ].map(([id, label]) => (
                  <label
                    key={id}
                    className={[
                      "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      retention === id
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    <input
                      type="radio"
                      name="retention"
                      className="accent-[color:var(--primary)]"
                      checked={retention === id}
                      onChange={() => setRetention(id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* What you'll get */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Brain, t: "Executive AI summary", d: "Plain-language risk and intent overview." },
                { icon: ScanText, t: "OCR + language", d: "Recovered text from scans and images." },
                { icon: Hash, t: "SHA256 · MD5 · SHA512", d: "Integrity hashes for chain of custody." },
                { icon: ShieldCheck, t: "Tampering score", d: "Edit indicators and image forensics." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-xl border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-primary" /> {t}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Live pipeline */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Live pipeline</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Session #A8F3
                </span>
              </div>
              <div className="mt-4">
                <LivePipeline pct={progress?.pct ?? 0} label={progress?.label} />
              </div>
            </div>
            <div className="glass rounded-2xl p-5 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" /> Privacy guarantee
              </div>
              Files never touch disk. The encrypted memory buffer is cryptographically erased
              the moment your report is sealed — verified by our auto-wipe attestation.
            </div>
          </aside>
        </div>
        )}
      </main>
    </div>
  );
}

const PHASES = [
  { name: "Buffer", min: 0 },
  { name: "Hash", min: 25 },
  { name: "Parse", min: 40 },
  { name: "OCR / AI", min: 70 },
  { name: "Wipe", min: 95 },
];

function LivePipeline({ pct, label }: { pct: number; label?: string }) {
  return (
    <ol className="space-y-2">
      {PHASES.map((p, i) => {
        const next = PHASES[i + 1]?.min ?? 101;
        const current = pct >= p.min && pct < next;
        const done = pct >= next;
        return (
          <li
            key={p.name}
            className={[
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all",
              current ? "border-primary/60 bg-primary/10 shadow-glow"
                : done ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5"
                : "border-border/60 bg-card/40",
            ].join(" ")}
          >
            <span className="font-medium">{p.name}</span>
            <span className={[
              "text-[11px] uppercase tracking-wider",
              current ? "text-primary" : done ? "text-[color:var(--success)]" : "text-muted-foreground/60",
            ].join(" ")}>
              {current ? (label ?? "Processing") : done ? "Complete" : "Queued"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
