export interface ExtractedPdfSignature {
  byteRange: number[];
  contents: Uint8Array;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, "");

  const out = new Uint8Array(clean.length / 2);

  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }

  return out;
}
function trimCmsPadding(bytes: Uint8Array): Uint8Array {
  let end = bytes.length;

  while (end > 0 && bytes[end - 1] === 0x00) {
    end--;
  }

  return bytes.slice(0, end);
}
export function extractPdfSignature(
  pdfBytes: Uint8Array,
): ExtractedPdfSignature | null {

  const pdf = new TextDecoder("latin1").decode(pdfBytes);

  const byteRangeMatch = pdf.match(
    /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/,
  );

  if (!byteRangeMatch) {
    return null;
  }

  const byteRange = byteRangeMatch
    .slice(1)
    .map(Number);

  const contentsMatch = pdf.match(
    /\/Contents\s*<([0-9A-Fa-f\s]+)>/,
  );

  if (!contentsMatch) {
    return null;
  }

  return {
    byteRange,
    contents: trimCmsPadding(
  hexToBytes(contentsMatch[1]),
),
  };
}
