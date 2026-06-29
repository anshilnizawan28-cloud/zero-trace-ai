import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";

export const Route = createFileRoute("/api-reference")({
  head: () => ({ meta: [{ title: "API Reference — ZeroVault" }, { name: "description", content: "REST and webhook reference for the ZeroVault forensic API." }] }),
  component: Api,
});

const ENDPOINTS = [
  { m: "POST", p: "/v1/analyze", d: "Submit a document for forensic analysis. Returns a job id." },
  { m: "GET",  p: "/v1/reports/:id", d: "Fetch a sealed report with full Document Trust Score." },
  { m: "POST", p: "/v1/signatures/verify", d: "Verify digital signatures embedded in a PDF or Office document." },
  { m: "POST", p: "/v1/compare", d: "Compare two documents and return a redline diff." },
  { m: "GET",  p: "/v1/usage", d: "Workspace usage and remaining credits for the billing period." },
];

function Api() {
  return (
    <PublicPage
      eyebrow="API"
      title={<>A clean REST API with <span className="text-gradient-cyber">predictable JSON</span>.</>}
      description="All endpoints support bearer auth via workspace API keys. Webhook events are signed with HMAC-SHA256."
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Method</th><th className="px-4 py-3">Endpoint</th><th className="px-4 py-3">Description</th></tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((e) => (
              <tr key={e.p} className="border-t border-border/60">
                <td className="px-4 py-3"><span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-xs font-semibold text-primary">{e.m}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{e.p}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-12 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-sm font-semibold">Example request</h2>
        <pre className="mt-3 overflow-auto rounded-lg border border-border/50 bg-background/60 p-4 text-[11px] leading-relaxed text-muted-foreground">{`curl -X POST https://api.zerovault.io/v1/analyze \\
  -H "Authorization: Bearer $ZEROVAULT_API_KEY" \\
  -F "file=@evidence.pdf" \\
  -F "ocr=true"`}</pre>
      </section>
    </PublicPage>
  );
}