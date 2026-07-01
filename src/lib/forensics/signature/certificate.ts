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

    const md1 = forge.md.sha1.create();
    md1.update(
      forge.asn1.toDer(asn1).getBytes(),
    );

    const md256 = forge.md.sha256.create();
    md256.update(
      forge.asn1.toDer(asn1).getBytes(),
    );

    return {
      subject,

      issuer,

      serialNumber: cert.serialNumber,

      validFrom: cert.validity.notBefore.toISOString(),

      validTo: cert.validity.notAfter.toISOString(),

      signatureAlgorithm:
        cert.siginfo?.algorithmOid ??
        cert.signatureOid,

      sha1Fingerprint: md1.digest().toHex(),

      sha256Fingerprint: md256.digest().toHex(),
    };
  } catch (err) {
    console.error("Certificate parsing failed", err);

    return null;
  }
}
