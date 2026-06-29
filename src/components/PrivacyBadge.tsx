import { ShieldCheck } from "lucide-react";

export function PrivacyBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1.5 text-xs font-medium text-[color:var(--success)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--success)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--success)]" />
      </span>
      <ShieldCheck className="h-3.5 w-3.5" />
      {compact ? "Zero Storage Active" : "Zero Storage · Memory-only processing · Auto-wipe enabled"}
    </div>
  );
}