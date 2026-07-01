import type { SignedData } from "pkijs";

export interface ValidationResult {
  valid: boolean;
  message: string;
  modifiedAfterSigning: boolean;
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

      message: result
        ? "Cryptographic signature verified successfully."
        : "Cryptographic verification failed.",

      modifiedAfterSigning: !result,

    };

  } catch (err) {

    console.error(
      "Signature validation failed",
      err,
    );

    return {

      valid: false,

      message:
        err instanceof Error
          ? err.message
          : "Signature validation failed.",

      modifiedAfterSigning: true,

    };

  }

}
