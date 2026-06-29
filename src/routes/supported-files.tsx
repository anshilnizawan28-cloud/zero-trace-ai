import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";
import { FileText, FileImage, FileSpreadsheet, FileCode2, Presentation, FileType2 } from "lucide-react";

export const Route = createFileRoute("/supported-files")({
  head: () => ({ meta: [{ title: "Supported File Types — ZeroVault" }, { name: "description", content: "Every format ZeroVault can analyze." }] }),
  component: Supported,
});

const GROUPS = [
  { icon: FileText, t: "Documents", items: ["PDF","DOCX","DOC","ODT","RTF","TXT","MD"] },
  { icon: FileSpreadsheet, t: "Spreadsheets", items: ["XLSX","XLS","ODS","CSV"] },
  { icon: Presentation, t: "Presentations", items: ["PPTX","PPT","ODP"] },
  { icon: FileImage, t: "Images (OCR)", items: ["JPEG","PNG","TIFF","BMP","WEBP"] },
  { icon: FileType2, t: "Email", items: ["EML","MSG"] },
  { icon: FileCode2, t: "Structured", items: ["JSON","XML","YAML"] },
];

function Supported() {
  return (
    <PublicPage
      eyebrow="Supported file types"
      title={<>If your team uses it, <span className="text-gradient-cyber">we analyze it.</span></>}
      description="Native parsers for office documents, structured data, and OCR for scans — all in encrypted memory."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map(({ icon: Icon, t, items }) => (
          <div key={t} className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-lg bg-gradient-cyber text-primary-foreground"><Icon className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">{t}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {items.map((x) => (
                <span key={x} className="rounded-full border border-border bg-background/40 px-2.5 py-0.5 text-[11px] font-mono">{x}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PublicPage>
  );
}