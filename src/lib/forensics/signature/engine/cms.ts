import * as forge from "node-forge";

export interface ParsedCms {
  certificates: forge.pki.Certificate[];
  signerCount: number;
  certificateCount: number;
  rawMessage: forge.pkcs7.PkcsSignedData;
}

export function parseCmsSignature(
  signatureBytes: Uint8Array,
): ParsedCms | null {

  if (!signatureBytes || signatureBytes.length === 0) {
    return null;
  }

  try {

    const der = forge.util.createBuffer(
      forge.util.binary.raw.encode(signatureBytes),
    );

    const asn1 = forge.asn1.fromDer(der);

    const p7 = forge.pkcs7.messageFromAsn1(asn1);

    return {

      certificates: p7.certificates ?? [],

      signerCount:
        p7.rawCapture?.signerInfos?.length ?? 0,

      certificateCount:
        p7.certificates?.length ?? 0,

      rawMessage: p7,

    };

  } catch (err) {

    console.error(
      "CMS parsing failed",
      err,
    );

    return null;

  }

}
