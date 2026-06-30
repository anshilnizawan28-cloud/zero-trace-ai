import type { PdfSignature } from "./types";

export function parsePdfSignatures(
  fieldNames: string[],
): PdfSignature[] {
  return fieldNames.map((fieldName) => ({
    fieldName,
    detected: true,
    cryptographicStatus: "Unknown",
    confidenceScore: 100,
    notes: [
      "Digital signature field detected.",
      "Cryptographic validation has not been performed yet.",
    ],
  }));
}
