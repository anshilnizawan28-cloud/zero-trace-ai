import type { ExtractResult } from "./types";
import { computeHashes } from "./hashes";

export type ProgressEvent =
  | { phase: "buffer"; pct: number }
  | { phase: "hash"; pct: number }
  | { phase: "parse"; pct: number; label: string }
  | { phase: "ocr"; pct: number; label: string }
  | { phase: "wipe"; pct: number };

function detectKind(file: File): "pdf" | "ooxml" | "image" | "text" | "unknown" {
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (/\.(docx|xlsx|pptx)$/.test(n)) return "ooxml";
  if (file.type.startsWith("image/") || /\.(png|jpe?g|tiff?|webp|gif|bmp)$/.test(n)) return "image";
  if (file.type.startsWith("text/") || /\.(txt|csv|json|md|rtf)$/.test(n)) return "text";
  return "unknown";
}

/**
 * Extract everything from a file in-memory. The ArrayBuffer is zeroed before
 * the function resolves; the caller never holds a reference to it again.
 */
export async function analyzeFile(
  file: File,
  onProgress: (e: ProgressEvent) => void,
): Promise<ExtractResult> {
  onProgress({ phase: "buffer", pct: 10 });
  const buf = await file.arrayBuffer();

  onProgress({ phase: "hash", pct: 30 });
  const hashes = await computeHashes(buf);

  const kind = detectKind(file);
  let metadata: ExtractResult["metadata"] = { encryption: { encrypted: false } };
  let text = "";
  let ocr: ExtractResult["ocr"] = { performed: false, isScanned: false };

  try {
    if (kind === "pdf") {
      const { parsePdf } = await import("./pdf");
      const r = await parsePdf(buf, (n, total, label) =>
        onProgress({ phase: "parse", pct: 30 + Math.round((n / total) * 40), label }),
      );
      metadata = r.metadata; text = r.text; ocr = r.ocr;

      // If scanned, run OCR on rasterized pages — skipped by default for size; flag instead.
      if (ocr.isScanned) {
        onProgress({ phase: "ocr", pct: 75, label: "Scanned PDF detected — page-level OCR is available on demand" });
      }
    } else if (kind === "ooxml") {
      const { parseOoxml } = await import("./office");
      onProgress({ phase: "parse", pct: 55, label: "Reading OOXML metadata" });
      const r = await parseOoxml(buf);
      metadata = r.metadata; text = r.text; ocr = r.ocr;
    } else if (kind === "image") {
      const { parseImage } = await import("./image");
      const r = await parseImage(buf, file.type || "image/png", (pct, label) =>
        onProgress({ phase: "ocr", pct: 30 + Math.round(pct * 0.5), label }),
      );
      metadata = r.metadata; text = r.text; ocr = r.ocr;
    } else if (kind === "text") {
      onProgress({ phase: "parse", pct: 60, label: "Reading plain text" });
      text = new TextDecoder().decode(buf);
      metadata = { application: "Plain text", encryption: { encrypted: false }, characterCount: text.length };
    } else {
      metadata = { application: "Unknown / unsupported binary", encryption: { encrypted: false } };
    }
  } catch (err) {
    metadata.raw = { ...(metadata.raw ?? {}), parserError: String((err as Error)?.message ?? err) };
  }

  const excerpt = text.slice(0, 15_000);

  onProgress({ phase: "wipe", pct: 95 });
  // Securely wipe the in-memory buffer
  new Uint8Array(buf).fill(0);

  onProgress({ phase: "wipe", pct: 100 });

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    metadata,
    textExcerpt: excerpt,
    fullTextLength: text.length,
    ocr,
    hashes,
  };
}
