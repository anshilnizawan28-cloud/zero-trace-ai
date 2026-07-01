import {
  extractPdfSignature,
} from "../engine/pdfSignatureExtractor";

import {
  parseCmsSignature,
} from "../engine/cms";

import {
  readCertificate,
  type CertificateInfo,
} from "./readCertificate";

export function extractCertificate(
  pdfBytes: Uint8Array,
): CertificateInfo | null {

  const signature =
    extractPdfSignature(pdfBytes);

  if (!signature) {
    return null;
  }

  const cms =
    parseCmsSignature(signature.contents);

  if (!cms) {
    return null;
  }

  if (
    !cms.certificates ||
    cms.certificates.length === 0
  ) {
    return null;
  }

  return readCertificate(
    cms.certificates[0],
  );

}
