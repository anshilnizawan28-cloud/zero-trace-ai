import type { DocMetadata, OcrResult } from "./types";

export async function parseImage(
  bytes: ArrayBuffer,
  mime: string,
  onProgress?: (pct: number, label: string) => void,
): Promise<{ metadata: DocMetadata; text: string; ocr: OcrResult }> {
  const meta: DocMetadata = {
    application: "Raster image",
    pageCount: 1,
    encryption: { encrypted: false },
  };

  // Run OCR with tesseract.js (lazy)
  let text = "";
  let confidence: number | undefined;
  let language = "eng";
  try {
    onProgress?.(0, "Loading OCR engine");
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, {
      logger: (m: any) => {
        if (m.status === "recognizing text") onProgress?.(Math.round((m.progress ?? 0) * 100), "OCR scanning");
      },
    });
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    try {
      const { data } = await worker.recognize(url);
      text = data.text ?? "";
      confidence = data.confidence;
      language = (data as any).language ?? "eng";
    } finally {
      URL.revokeObjectURL(url);
      await worker.terminate();
    }
  } catch (e) {
    text = "";
  }

  return {
    metadata: meta,
    text,
    ocr: { performed: true, isScanned: true, text, confidence, language, pagesOcred: 1 },
  };
}
