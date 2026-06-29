import { md5Hex } from "./md5";

async function sha(algo: "SHA-256" | "SHA-512", bytes: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function computeHashes(bytes: ArrayBuffer) {
  const u8 = new Uint8Array(bytes);
  const [sha256, sha512] = await Promise.all([sha("SHA-256", bytes), sha("SHA-512", bytes)]);
  return { md5: md5Hex(u8), sha256, sha512 };
}

export async function verifyHash(bytes: ArrayBuffer, expected: string, algo: "SHA-256" | "SHA-512" | "MD5") {
  const got = algo === "MD5" ? md5Hex(new Uint8Array(bytes)) : await sha(algo, bytes);
  return got.toLowerCase() === expected.toLowerCase();
}
