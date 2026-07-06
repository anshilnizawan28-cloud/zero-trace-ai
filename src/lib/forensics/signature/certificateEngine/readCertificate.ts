// @ts-nocheck
import * as forge from "node-forge";

export interface CertificateInfo {
  commonName?: string;
  organization?: string;
  organizationalUnit?: string;
  email?: string;
  country?: string;

  issuer?: string;

  serialNumber?: string;

  validFrom?: string;
  validTo?: string;

  signatureAlgorithm?: string;

  sha1Fingerprint?: string;
  sha256Fingerprint?: string;
}

function getAttribute(
  cert: forge.pki.Certificate,
  shortName: string,
): string | undefined {
  return cert.subject.attributes.find(
    (a) => a.shortName === shortName,
  )?.value;
}

export function readCertificate(
  cert: forge.pki.Certificate,
): CertificateInfo {

  const der = forge.asn1.toDer(
    forge.pki.certificateToAsn1(cert),
  ).getBytes();

  const sha1 = forge.md.sha1.create();
  sha1.update(der);

  const sha256 = forge.md.sha256.create();
  sha256.update(der);

  return {

    commonName: getAttribute(cert, "CN"),

    organization: getAttribute(cert, "O"),

    organizationalUnit: getAttribute(cert, "OU"),

    email: getAttribute(cert, "E"),

    country: getAttribute(cert, "C"),

    issuer: cert.issuer.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(", "),

    serialNumber: cert.serialNumber,

    validFrom: cert.validity.notBefore.toISOString(),

    validTo: cert.validity.notAfter.toISOString(),

    signatureAlgorithm:
      cert.siginfo?.algorithmOid ??
      cert.signatureOid,

    sha1Fingerprint:
      sha1.digest().toHex(),

    sha256Fingerprint:
      sha256.digest().toHex(),

  };

}
