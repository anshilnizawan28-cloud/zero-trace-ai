import {
  Upload, Lock, FileSearch, ScanText, Hash, Brain, ShieldAlert,
  GitCompare, FileText, Trash2, CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  { icon: Upload, label: "Upload" },
  { icon: Lock, label: "Encrypted Memory Buffer" },
  { icon: FileSearch, label: "Metadata Extraction" },
  { icon: ScanText, label: "OCR" },
  { icon: Hash, label: "Hash Generation" },
  { icon: Brain, label: "AI Analysis" },
  { icon: ShieldAlert, label: "Tampering Detection" },
  { icon: GitCompare, label: "Comparison" },
  { icon: FileText, label: "Generate Report" },
  { icon: Trash2, label: "Secure Memory Wipe" },
  { icon: CheckCircle2, label: "File Permanently Deleted" },
];

export function ProcessingPipeline({ autoplay = true }: { autoplay?: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      setActive((a) => (a + 1) % (STEPS.length + 2));
    }, 900);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div className="relative">
      <ol className="relative grid gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = active > i;
          const current = active === i;
          return (
            <li
              key={s.label}
              className={[
                "group relative flex items-center gap-4 rounded-xl border px-4 py-3 transition-all",
                current
                  ? "border-primary/50 bg-primary/10 shadow-glow"
                  : done
                    ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5"
                    : "border-border/60 bg-card/40",
              ].join(" ")}
            >
              <div
                className={[
                  "grid h-9 w-9 place-items-center rounded-lg",
                  current
                    ? "bg-gradient-cyber text-primary-foreground animate-pulse-glow"
                    : done
                      ? "bg-[color:var(--success)]/20 text-[color:var(--success)]"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 text-sm font-medium">{s.label}</div>
              <span
                className={[
                  "text-[11px] uppercase tracking-wider",
                  current ? "text-primary" : done ? "text-[color:var(--success)]" : "text-muted-foreground/60",
                ].join(" ")}
              >
                {current ? "Processing" : done ? "Complete" : "Queued"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}