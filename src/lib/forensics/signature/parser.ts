import type { PdfSignature } from "./types";
import { extractCertificate } from "./certificateEngine";

export async function parsePdfSignatures(
  fieldNames: string[],
  pdfBytes?: Uint8Array,
): Promise<PdfSignature[]> {

  const signatures: PdfSignature[] = [];

  const certificate =
    pdfBytes
      ? extractCertificate(pdfBytes)
      : null;

  for (const fieldName of fieldNames) {

    signatures.push({

      fieldName,

      detected: true,

      cryptographicStatus:
        certificate
          ? "Certificate Parsed"
          : "Unknown",

      confidenceScore:
        certificate
          ? 100
          : 80,

      notes: certificate
        ? [
            "Digital signature detected.",
            "Embedded X.509 certificate successfully parsed.",
          ]
        : [
            "Digital signature field detected.",
            "No embedded certificate could be extracted.",
          ],

      ...(certificate ?? {}),

    });

  }

  return signatures;
}
