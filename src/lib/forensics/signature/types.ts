export interface PdfSignature {
  fieldName: string;

  detected: boolean;

  cryptographicStatus: "Unknown";

  confidenceScore: number;

  notes: string[];
}
