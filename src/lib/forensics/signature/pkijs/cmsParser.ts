// @ts-nocheck
import * as asn1js from "asn1js";
import {
  ContentInfo,
  SignedData,
} from "pkijs";

export interface ParsedCms {
  contentInfo: ContentInfo;
  signedData: SignedData;
}

export function parseCms(
  cmsBytes: Uint8Array,
): ParsedCms | null {

  try {

    const buffer = cmsBytes.buffer.slice(
      cmsBytes.byteOffset,
      cmsBytes.byteOffset + cmsBytes.byteLength,
    );

    const asn1 = asn1js.fromBER(buffer);
console.log("CMS ASN1 offset:", asn1.offset);
console.log("CMS ASN1 result:", asn1.result);

    if (asn1.offset === -1) {
  console.error(
    "ASN1 parse failed. First 32 bytes:",
    Buffer.from(cmsBytes.slice(0, 32)).toString("hex")
  );

  return null;
}

    return {

      contentInfo,

      signedData,

    };

  } catch (err) {

    console.error(
      "CMS parser failed",
      err,
    );

    return null;

  }

}
