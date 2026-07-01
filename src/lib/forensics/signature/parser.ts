import type { PdfSignature } from "./types";
import { parseCertificate } from "./certificate";

export async function parsePdfSignatures(
  fieldNames: string[],
): Promise<PdfSignature[]> {

  const signatures: PdfSignature[] = [];

  for (const fieldName of fieldNames) {

    const certificate = null;

    signatures.push({

      fieldName,

      detected: true,

      cryptographicStatus: "Unknown",

      confidenceScore: 100,

      notes: [
        "Digital signature field detected.",
        "Cryptographic validation has not been performed yet.",
      ],

      ...(certificate ?? {}),

    });

  }

  return signatures;
}
