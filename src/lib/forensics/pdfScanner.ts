export interface PdfSecurityScan {
  hasJavaScript: boolean;
  hasOpenAction: boolean;
  hasLaunchAction: boolean;
  hasEmbeddedFiles: boolean;
  hasAcroForm: boolean;
  hasIncrementalUpdates: boolean;
  hasObjectStreams: boolean;
  hasEncryption: boolean;
  suspiciousKeywords: string[];
}

export function scanPdf(pdfBytes: Uint8Array): PdfSecurityScan {
  const pdf = new TextDecoder("latin1").decode(pdfBytes);

  const suspiciousKeywords: string[] = [];

  function has(keyword: string): boolean {
    return pdf.includes(keyword);
  }

  const hasJavaScript = has("/JavaScript");
  const hasOpenAction = has("/OpenAction");
  const hasLaunchAction = has("/Launch");
  const hasEmbeddedFiles = has("/EmbeddedFile");
  const hasAcroForm = has("/AcroForm");
  const hasObjectStreams = has("/ObjStm");
  const hasEncryption = has("/Encrypt");

  const hasIncrementalUpdates =
    (pdf.match(/startxref/g) || []).length > 1;

  if (hasJavaScript) suspiciousKeywords.push("JavaScript");
  if (hasOpenAction) suspiciousKeywords.push("OpenAction");
  if (hasLaunchAction) suspiciousKeywords.push("Launch");
  if (hasEmbeddedFiles) suspiciousKeywords.push("EmbeddedFile");
  if (hasIncrementalUpdates) suspiciousKeywords.push("Incremental Update");

  return {
    hasJavaScript,
    hasOpenAction,
    hasLaunchAction,
    hasEmbeddedFiles,
    hasAcroForm,
    hasIncrementalUpdates,
    hasObjectStreams,
    hasEncryption,
    suspiciousKeywords,
  };
}
