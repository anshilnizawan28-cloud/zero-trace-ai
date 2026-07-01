import type { Certificate } from "pkijs";

export interface ParsedCertificate {
  subject?: string;
  organization?: string;
  email?: string;
  issuer?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
  fingerprintSha256?: string;
  signatureAlgorithm?: string;
}

function readAttribute(
  cert: Certificate,
  oid: string,
): string | undefined {

  const attr = cert.subject.typesAndValues.find(
    (x) => x.type === oid,
  );

  if (!attr) return undefined;

  return attr.value.valueBlock.value;
}

function readIssuer(
  cert: Certificate,
): string {

  return cert.issuer.typesAndValues
    .map((x) => {

      const value =
        x.value.valueBlock.value;

      return `${x.type}=${value}`;

    })
    .join(", ");
}

export function parseCertificate(
  cert: Certificate,
): ParsedCertificate {

  return {

    subject:
      readAttribute(cert, "2.5.4.3"),

    organization:
      readAttribute(cert, "2.5.4.10"),

    email:
      readAttribute(
        cert,
        "1.2.840.113549.1.9.1",
      ),

    issuer:
      readIssuer(cert),

    serialNumber:
      cert.serialNumber.valueBlock.toString(),

    validFrom:
      cert.notBefore.value.toISOString(),

    validTo:
      cert.notAfter.value.toISOString(),

    signatureAlgorithm:
      cert.signatureAlgorithm.algorithmId,

    fingerprintSha256:
      undefined,

  };

}
