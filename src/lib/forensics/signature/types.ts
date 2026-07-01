export interface PdfSignature {
  fieldName: string;

  detected: boolean;

  cryptographicStatus:
    | "Valid"
    | "Invalid"
    | "Unknown";

  confidenceScore: number;

  notes: string[];

  issuer?: string;

  subject?: string;

  serialNumber?: string;

  validFrom?: string;

  validTo?: string;

  thumbprint?: string;

  signatureAlgorithm?: string;

  publicKeyAlgorithm?: string;

  trusted?: boolean;
}
