// @ts-nocheck
import * as forge from "node-forge";

export interface ParsedCertificate {
  subject?: string;
  issuer?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
  signatureAlgorithm?: string;
  sha1Fingerprint?: string;
  sha256Fingerprint?: string;
}

export function parseCertificate(
  certificateBytes?: Uint8Array,
): ParsedCertificate | null {

  if (!certificateBytes || certificateBytes.length === 0) {
    return null;
  }

  try {
    const der = forge.util.createBuffer(certificateBytes);

    const asn1 = forge.asn1.fromDer(der);

    const cert = forge.pki.certificateFromAsn1(asn1);

    const subject = cert.subject.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(", ");

    const issuer = cert.issuer.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(", ");

    let sha1Fingerprint = "";
    let sha256Fingerprint = "";

    try {
      const derBytes = forge.asn1.toDer(asn1).getBytes();

      if (forge.md?.sha1?.create) {
        const md1 = forge.md.sha1.create();
        md1.update(derBytes);
        sha1Fingerprint = md1.digest().toHex();
      }

      if (forge.md?.sha256?.create) {
        const md256 = forge.md.sha256.create();
        md256.update(derBytes);
        sha256Fingerprint = md256.digest().toHex();
      }
    } catch (err) {
      console.warn("Fingerprint generation skipped", err);
    }

    return {
      subject,
      issuer,
      serialNumber: cert.serialNumber,
      validFrom: cert.validity.notBefore.toISOString(),
      validTo: cert.validity.notAfter.toISOString(),
      signatureAlgorithm:
        cert.siginfo?.algorithmOid ??
        cert.signatureOid,
      sha1Fingerprint,
      sha256Fingerprint,
    };

  } catch (err) {
    console.error("Certificate parsing failed", err);
    return null;
  }
}
