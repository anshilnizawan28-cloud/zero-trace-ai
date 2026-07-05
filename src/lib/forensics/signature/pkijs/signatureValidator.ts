import type { SignedData } from "pkijs";

export interface ValidationResult {
  valid: boolean;

  trusted: boolean;

  message: string;

  modifiedAfterSigning: boolean;

  timestampPresent: boolean;

  trustChainStatus:
    | "Trusted"
    | "Untrusted"
    | "Unknown";

  revocationStatus:
    | "Good"
    | "Revoked"
    | "Unknown";
}
export async function validateSignature(
  signedData: SignedData,
): Promise<ValidationResult> {

  try {

    const result = await signedData.verify({
      signer: 0,
      checkChain: false,
    });

    return {

  valid: !!result,

  trusted: !!result,

  message: result
    ? "Cryptographic signature verified successfully."
    : "Cryptographic verification failed.",

  modifiedAfterSigning: !result,

  timestampPresent: false,

  trustChainStatus: result
    ? "Trusted"
    : "Unknown",

  revocationStatus: "Unknown",

};
  } catch (err) {

    console.error(
      "Signature validation failed",
      err,
    );

   return {

  valid: false,

  trusted: false,

  message:
    err instanceof Error
      ? err.message
      : "Signature validation failed.",

  modifiedAfterSigning: true,

  timestampPresent: false,

  trustChainStatus: "Unknown",

  revocationStatus: "Unknown",

};

  }

}
