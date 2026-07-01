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

    if (asn1.offset === -1) {

      console.error("Invalid CMS ASN.1");

      return null;

    }

    const contentInfo = new ContentInfo({
      schema: asn1.result,
    });

    const signedData = new SignedData({
      schema: contentInfo.content,
    });

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
