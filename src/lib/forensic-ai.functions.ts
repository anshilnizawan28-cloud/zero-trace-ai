import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  metadata: z.record(z.unknown()),
  textExcerpt: z.string().max(20_000),
  fullTextLength: z.number(),
  ocr: z.object({
    performed: z.boolean(),
    isScanned: z.boolean(),
    confidence: z.number().optional(),
    language: z.string().optional(),
    pagesOcred: z.number().optional(),
    text: z.string().optional(),
  }),
  hashes: z.object({ md5: z.string(), sha256: z.string(), sha512: z.string() }),
});

export type ForensicReport = {
  executiveSummary: string;
  metadataInterpretation: string;
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High" | "Critical";
  tamperingConfidence: number;
  editingLikelihood: number;
  suspiciousIndicators: string[];
  editingSoftwareDetected: string[];
  timeline: Array<{ when: string; what: string; source: string }>;
  recommendations: string[];
  language?: string;
  topics?: string[];
};

const SYSTEM = `You are a senior digital forensics analyst. You analyze document metadata, content excerpts, and integrity hashes to assess authenticity and tampering risk.

You return STRICT JSON matching this TypeScript type:
{
  "executiveSummary": string,                 // 3-5 sentence plain-language summary
  "metadataInterpretation": string,           // What the metadata says about origin, software chain, edit history
  "riskScore": number,                        // 0-100
  "riskLabel": "Low" | "Medium" | "High" | "Critical",
  "tamperingConfidence": number,              // 0-100 confidence document was tampered
  "editingLikelihood": number,                // 0-100 likelihood of post-creation edits
  "suspiciousIndicators": string[],           // concrete findings; empty if none
  "editingSoftwareDetected": string[],        // e.g. "Microsoft Word 2019", "Adobe Acrobat Pro DC"
  "timeline": [{ "when": ISO-8601 string, "what": string, "source": string }],
  "recommendations": string[],
  "language": string,                         // best-guess ISO code from text excerpt
  "topics": string[]                          // 3-6 high-level topics
}

Rules:
- Base every claim on the supplied data. Never fabricate dates, authors, or software not present.
- If a Producer differs from Creator, note it (common but worth flagging when combined with other signals).
- Treat the presence of track-changes, comments, multiple revisions, mismatched create/modify timestamps, or signs of OCR over a digitally-born document as raising risk.
- A clean unsigned document with consistent metadata is Low risk. Use Critical only with concrete tampering indicators.
- Output ONLY the JSON object. No markdown, no commentary.`;

export const runForensicAnalysis = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<ForensicReport> => {
    const { callLovableAiJson } = await import("./ai-gateway.server");

    const user = JSON.stringify(
      {
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        hashes: data.hashes,
        metadata: data.metadata,
        ocr: { ...data.ocr, text: undefined, textPreview: data.ocr.text?.slice(0, 2000) },
        fullTextLength: data.fullTextLength,
        textExcerpt: data.textExcerpt,
      },
      null,
      2,
    );

    try {
      const report = await callLovableAiJson<ForensicReport>({
        system: SYSTEM,
        user: `Analyze this document forensically and return the JSON object only.\n\n${user}`,
      });

      // Defensive normalization
      const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n ?? 0)));
      report.riskScore = clamp(report.riskScore);
      report.tamperingConfidence = clamp(report.tamperingConfidence);
      report.editingLikelihood = clamp(report.editingLikelihood);
      if (!report.riskLabel) {
        report.riskLabel = report.riskScore >= 80 ? "Critical" : report.riskScore >= 55 ? "High" : report.riskScore >= 30 ? "Medium" : "Low";
      }
      report.suspiciousIndicators ??= [];
      report.editingSoftwareDetected ??= [];
      report.timeline ??= [];
      report.recommendations ??= [];
      return report;
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 429) throw new Error("AI gateway rate limit exceeded. Please retry shortly.");
      if (err.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Plans & credits.");
      throw err;
    }
  });
