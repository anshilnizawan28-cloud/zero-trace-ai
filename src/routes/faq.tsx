import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQs — ZeroVault" }, { name: "description", content: "Frequently asked questions about Zero Storage, pricing, and security." }] }),
  component: FAQ,
});

const FAQS: [string, string][] = [
  ["What does Zero Storage actually mean?", "Document bytes are buffered into encrypted memory only. Never written to disk, never backed up, and cryptographically erased after the report is sealed."],
  ["Do you use my documents to train AI?", "No. Customer documents are never used for training. Our AI gateway processes content in isolation and discards it."],
  ["What file types are supported?", "PDF, DOCX, XLSX, PPTX, ODT, RTF, TXT, CSV, JSON, and image formats (JPEG, PNG, TIFF) for OCR."],
  ["Can I save reports?", "Yes. Reports (not document bytes) can be saved to your workspace, exported, or sent to your SIEM via webhook on Business+."],
  ["Do you offer SSO?", "Google and Microsoft SSO on Business. SAML 2.0 and SCIM provisioning on Enterprise."],
  ["What about on-premise?", "Enterprise customers can deploy ZeroVault inside their own VPC or as an air-gapped appliance."],
];

function FAQ() {
  return (
    <PublicPage
      eyebrow="FAQs"
      title={<>Common questions, <span className="text-gradient-cyber">straight answers.</span></>}
      description="Still stuck? Contact us — we'll respond within one business day."
    >
      <div className="mx-auto max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="cursor-pointer list-none text-base font-semibold marker:hidden"><span className="text-primary">+ </span>{q}</summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </PublicPage>
  );
}