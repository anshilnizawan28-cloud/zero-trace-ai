import type { DocMetadata, OcrResult } from "./types";

// pdfjs worker setup (Vite-friendly)
import * as pdfjs from "pdfjs-dist";
// @ts-expect-error - vite worker url import
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
(pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerUrl;

function fmtPdfDate(d?: string): string | undefined {
  if (!d) return undefined;
  // PDF date: D:YYYYMMDDHHmmSSOHH'mm'
  const m = /^D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/.exec(d);
  if (!m) return d;
  const [, Y, Mo = "01", D = "01", h = "00", mi = "00", s = "00"] = m;
  const iso = `${Y}-${Mo}-${D}T${h}:${mi}:${s}Z`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? d : dt.toISOString();
}

export async function parsePdf(bytes: ArrayBuffer, onProgress?: (n: number, total: number, label: string) => void) {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
  const doc = await loadingTask.promise;

  const meta = await doc.getMetadata().catch(() => ({ info: {}, metadata: null } as any));
  const info = (meta.info ?? {}) as Record<string, any>;

  const fonts = new Set<string>();
  const embedded: string[] = [];
  const annotations: string[] = [];
  let textBuf = "";
  let scannedPages = 0;

  const total = doc.numPages;
  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList().catch(() => null);
    // collect fonts
    const commonObjs: Record<string, any> = (page as any).commonObjs?._objs ?? {};
    for (const key of Object.keys(commonObjs)) {
      const v = commonObjs[key]?.data;
      const name = v?.name || v?.loadedName;
      if (name && typeof name === "string") fonts.add(name);
    }
    const tc = await page.getTextContent().catch(() => ({ items: [] as any[] }));
    const pageText = tc.items.map((it: any) => it.str).join(" ").trim();
    textBuf += pageText + "\n";
    if (pageText.length < 20) scannedPages++;

    const ann = await page.getAnnotations().catch(() => [] as any[]);
    for (const a of ann) {
      if (a.subtype === "FileAttachment") embedded.push(a.attachment?.filename ?? "embedded-file");
      if (a.subtype === "Widget" && a.fieldType === "Sig") annotations.push(a.fieldName ?? "signature");
      if (a.subtype === "Text" || a.subtype === "Popup") annotations.push(`comment: ${a.contents?.slice(0, 80) ?? ""}`);
    }
    onProgress?.(i, total, `Parsing page ${i}/${total}`);
    ops && void ops;
  }

  const sigs: string[] = annotations.filter((a) => !a.startsWith("comment:"));
  const comments: string[] = annotations.filter((a) => a.startsWith("comment:")).map((c) => c.replace(/^comment:\s*/, ""));

  const encrypted = (doc as any)._pdfInfo?.encrypted ?? false;

  const metadata: DocMetadata = {
    author: info.Author,
    creator: info.Creator,
    producer: info.Producer,
    title: info.Title,
    subject: info.Subject,
    keywords: info.Keywords,
    application: info.Creator,
    createdDate: fmtPdfDate(info.CreationDate),
    modifiedDate: fmtPdfDate(info.ModDate),
    pageCount: doc.numPages,
    fonts: Array.from(fonts).slice(0, 40),
    embeddedObjects: embedded,
    hiddenComments: comments,
    digitalSignatures: sigs,
    encryption: { encrypted, method: encrypted ? "PDF standard security" : undefined },
    pdfVersion: (doc as any)._pdfInfo?.version,
    language: info.Language,
    raw: info,
  };

  const ocr: OcrResult = {
    performed: false,
    isScanned: scannedPages > Math.max(1, Math.floor(total * 0.6)),
  };

  await doc.cleanup();
  await doc.destroy();

  return { metadata, text: textBuf.trim(), ocr };
}
