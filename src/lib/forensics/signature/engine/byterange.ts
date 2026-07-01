export interface ByteRange {

  start1: number;

  length1: number;

  start2: number;

  length2: number;

}

export function extractByteRange(
  pdfBytes: Uint8Array,
): ByteRange | null {

  const pdf = new TextDecoder("latin1").decode(pdfBytes);

  const match =
    /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/.exec(pdf);

  if (!match) {
    return null;
  }

  return {

    start1: Number(match[1]),

    length1: Number(match[2]),

    start2: Number(match[3]),

    length2: Number(match[4]),

  };

}

export function getSignedBytes(
  pdfBytes: Uint8Array,
  range: ByteRange,
): Uint8Array {

  const part1 = pdfBytes.slice(
    range.start1,
    range.start1 + range.length1,
  );

  const part2 = pdfBytes.slice(
    range.start2,
    range.start2 + range.length2,
  );

  const merged = new Uint8Array(
    part1.length + part2.length,
  );

  merged.set(part1);

  merged.set(part2, part1.length);

  return merged;

}
