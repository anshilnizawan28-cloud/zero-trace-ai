import * as forge from "node-forge";

export interface HashResult {
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
}

function digest(
  algorithm:
    | "sha1"
    | "sha256"
    | "sha384"
    | "sha512",
  bytes: Uint8Array,
): string {

  const md = forge.md[algorithm].create();

  md.update(
    forge.util.binary.raw.encode(bytes),
  );

  return md.digest().toHex();

}

export function calculateHashes(
  bytes: Uint8Array,
): HashResult {

  return {

    sha1: digest("sha1", bytes),

    sha256: digest("sha256", bytes),

    sha384: digest("sha384", bytes),

    sha512: digest("sha512", bytes),

  };

}
