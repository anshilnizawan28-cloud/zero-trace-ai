import type { PdfSignature } from "./types";

import { extractPdfSignature } from "./engine/pdfSignatureExtractor";

import { parseCms } from "./pkijs/cmsParser";

import { parseCertificate } from "./pkijs/certificateParser";

import { validateSignature } from "./pkijs/signatureValidator";

export async function parsePdfSignatures(
  fieldNames: string[],
  pdfBytes: Uint8Array,
): Promise<PdfSignature[]> {

  const signatures: PdfSignature[] = [];

  const extracted = extractPdfSignature(pdfBytes);

  if (!extracted) {

    return fieldNames.map((fieldName) => ({

      fieldName,

      detected: true,

      cryptographicStatus: "Unknown",

      confidenceScore: 40,

      notes: [
        "Signature field detected.",
        "Unable to extract CMS signature.",
      ],

    }));

  }

  const cms = parseCms(extracted.contents);

  if (!cms) {

    return fieldNames.map((fieldName) => ({

      fieldName,

      detected: true,

      cryptographicStatus: "Unknown",

      confidenceScore: 50,

      notes: [
        "CMS parsing failed.",
      ],

    }));

  }

  const cert = cms.signedData.certificates?.[0];

  let certInfo;

  if (cert) {
    certInfo = parseCertificate(cert as any);
  }

  const verification =
    await validateSignature(cms.signedData);

  for (const fieldName of fieldNames) {

    signatures.push({

      fieldName,

      detected: true,

      cryptographicStatus:
        verification.valid
          ? "Valid"
          : "Invalid",

      confidenceScore:
        verification.valid
          ? 100
          : 25,

      notes: [
        verification.message,
      ],

      issuer:
        certInfo?.issuer,

      subject:
        certInfo?.subject,

      serialNumber:
        certInfo?.serialNumber,

      validFrom:
        certInfo?.validFrom,

      validTo:
        certInfo?.validTo,

      signatureAlgorithm:
        "RSA",

      trusted: verification.trusted,

    });

  }

  return signatures;

}
