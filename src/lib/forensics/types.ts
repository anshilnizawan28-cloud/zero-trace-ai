export interface DocMetadata {
  author?: string;
  creator?: string;
  producer?: string;
  company?: string;
  application?: string;
  title?: string;
  subject?: string;
  keywords?: string;
  createdDate?: string;
  modifiedDate?: string;
  lastModifiedBy?: string;
  revisionNumber?: string | number;
  totalEditingTime?: string | number;
  pageCount?: number;
  wordCount?: number;
  characterCount?: number;
  fonts?: string[];
  embeddedObjects?: string[];
  hiddenComments?: string[];
  trackChanges?: string[];
  digitalSignatures?: string[];
  encryption?: { encrypted: boolean; method?: string };
  pdfVersion?: string;
  language?: string;
  raw?: Record<string, unknown>;
}

export interface OcrResult {
  performed: boolean;
  isScanned: boolean;
  text?: string;
  confidence?: number;
  language?: string;
  pagesOcred?: number;
}

export interface Hashes { md5: string; sha256: string; sha512: string }

export interface ExtractResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata: DocMetadata;
  textExcerpt: string;
  fullTextLength: number;
  ocr: OcrResult;
  hashes: Hashes;
}
