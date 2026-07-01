export interface ValidationResult {

  valid: boolean;

  expectedDigest?: string;

  calculatedDigest?: string;

  message: string;

}

export function validateDigest(
  expectedDigest: string,
  calculatedDigest: string,
): ValidationResult {

  const valid =
    expectedDigest.toLowerCase() ===
    calculatedDigest.toLowerCase();

  return {

    valid,

    expectedDigest,

    calculatedDigest,

    message: valid
      ? "Digital signature verified."
      : "Document has been modified after signing.",

  };

}
