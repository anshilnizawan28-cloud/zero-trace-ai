export interface PdfSignatureData {
  fieldName: string;

  byteRange?: number[];

  rawContents?: Uint8Array;

  hasCertificate: boolean;

  hasTimestamp: boolean;

  signatureLength: number;
}

export interface CertificateInfo {
  commonName?: string;
  organization?: string;
  organizationalUnit?: string;
  email?: string;
  country?: string;

  issuerCommonName?: string;
  issuerOrganization?: string;

  serialNumber?: string;

  validFrom?: string;
  validTo?: string;

  signatureAlgorithm?: string;

  expired: boolean;

  selfSigned: boolean;

  fingerprintSHA1?: string;

  fingerprintSHA256?: string;
}

export interface SignatureValidationResult {
  detected: boolean;

  cryptographicallyValid: boolean;

  modifiedAfterSigning: boolean;

  trustScore: number;

  status: "VALID" | "INVALID" | "UNKNOWN";

  certificate?: CertificateInfo;

  notes: string[];
}
