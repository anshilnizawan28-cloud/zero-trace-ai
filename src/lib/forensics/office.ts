import JSZip from "jszip";
import type { DocMetadata, OcrResult } from "./types";

function textOf(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(xml);
  return m?.[1]?.trim() || undefined;
}
function allText(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

/** Read OOXML core.xml + app.xml metadata (works for docx/xlsx/pptx) */
export async function parseOoxml(bytes: ArrayBuffer): Promise<{ metadata: DocMetadata; text: string; ocr: OcrResult }> {
  const zip = await JSZip.loadAsync(bytes);

  const core = await zip.file("docProps/core.xml")?.async("string");
  const app = await zip.file("docProps/app.xml")?.async("string");
  const customs = await zip.file("docProps/custom.xml")?.async("string");

  const meta: DocMetadata = { raw: {} };

  if (core) {
    meta.author = textOf(core, "dc:creator");
    meta.lastModifiedBy = textOf(core, "cp:lastModifiedBy");
    meta.createdDate = textOf(core, "dcterms:created");
    meta.modifiedDate = textOf(core, "dcterms:modified");
    meta.title = textOf(core, "dc:title");
    meta.subject = textOf(core, "dc:subject");
    meta.keywords = textOf(core, "cp:keywords");
    meta.revisionNumber = textOf(core, "cp:revision");
    meta.language = textOf(core, "dc:language");
  }
  if (app) {
    meta.application = textOf(app, "Application");
    meta.company = textOf(app, "Company");
    meta.producer = textOf(app, "AppVersion");
    meta.totalEditingTime = textOf(app, "TotalTime");
    const pages = textOf(app, "Pages") ?? textOf(app, "Slides");
    meta.pageCount = pages ? Number(pages) : undefined;
    meta.wordCount = Number(textOf(app, "Words")) || undefined;
    meta.characterCount = Number(textOf(app, "Characters")) || undefined;
  }
  if (customs) meta.raw!.customProps = customs.slice(0, 2000);

  // Fonts (word/fontTable.xml)
  const fontTable = await zip.file("word/fontTable.xml")?.async("string");
  if (fontTable) {
    const fonts = Array.from(fontTable.matchAll(/<w:font\s+w:name="([^"]+)"/g)).map((m) => m[1]);
    meta.fonts = Array.from(new Set(fonts));
  }

  // Track changes & comments
  const docXml = await zip.file("word/document.xml")?.async("string");
  const commentsXml = await zip.file("word/comments.xml")?.async("string");
  const trackChanges: string[] = [];
  if (docXml) {
    for (const tag of ["w:ins", "w:del", "w:moveFrom", "w:moveTo"]) {
      const found = docXml.match(new RegExp(`<${tag}\\b`, "g"));
      if (found?.length) trackChanges.push(`${tag} ×${found.length}`);
    }
  }
  meta.trackChanges = trackChanges;
  if (commentsXml) {
    meta.hiddenComments = allText(commentsXml, "w:t").slice(0, 50);
  }

  // Embedded objects
  const embedded: string[] = [];
  zip.folder("word/embeddings")?.forEach((p) => embedded.push(p));
  zip.folder("xl/embeddings")?.forEach((p) => embedded.push(p));
  zip.folder("ppt/embeddings")?.forEach((p) => embedded.push(p));
  meta.embeddedObjects = embedded;

  // Digital signatures
  const sigs: string[] = [];
  zip.folder("_xmlsignatures")?.forEach((p) => sigs.push(p));
  meta.digitalSignatures = sigs;

  meta.encryption = { encrypted: false };

  // Extract body text
  let text = "";
  if (docXml) {
    // mammoth for docx — better quality
    try {
      const mammoth = await import("mammoth/mammoth.browser");
      const { value } = await (mammoth as any).extractRawText({ arrayBuffer: bytes });
      text = String(value ?? "");
    } catch {
      text = allText(docXml, "w:t").join(" ");
    }
  } else {
    // xlsx / pptx fallback: dump all shared strings / slides text
    const files = Object.keys(zip.files);
    const xmlBlobs = await Promise.all(
      files.filter((f) => f.endsWith(".xml") && (f.includes("sharedStrings") || f.includes("slide") || f.includes("sheet")))
        .slice(0, 50)
        .map((f) => zip.file(f)!.async("string")),
    );
    text = xmlBlobs.flatMap((x) => allText(x, "t").concat(allText(x, "a:t"))).join(" ");
  }

  return {
    metadata: meta,
    text: text.slice(0, 1_500_000),
    ocr: { performed: false, isScanned: false },
  };
}
