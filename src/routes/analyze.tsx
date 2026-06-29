import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, Trash2, ShieldCheck, Brain, Hash, ScanText, Clock } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          {/* Upload */}
          <section className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all",
                drag ? "border-primary bg-primary/10 shadow-glow" : "border-border/70 bg-card/40 hover:border-primary/50 hover:bg-card",
              ].join(" ")}
            >
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="relative mx-auto flex max-w-md flex-col items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-cyber text-primary-foreground shadow-glow animate-float">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div className="text-lg font-semibold">Drop a document to analyze</div>
                <div className="text-xs text-muted-foreground">{SUPPORTED}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground/80">Max 2 GB · No copy of your file will be stored</div>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {file && (
              <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-glow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Processing securely…
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
                <ProcessingPipeline />
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
      </main>
    </div>
  );
}