import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/PublicPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — ZeroVault" }, { name: "description", content: "What we collect, what we don't, and how Zero Storage protects your documents." }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicPage
      eyebrow="Privacy"
      title={<>Your documents are <span className="text-gradient-cyber">never our training data</span>.</>}
      description="How ZeroVault handles your data, in plain language."
    >
      <div className="prose prose-invert max-w-3xl">
        <h2 className="text-xl font-semibold">What we never store by default</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>• The bytes of any document you upload</li>
          <li>• OCR text content beyond your active session</li>
          <li>• File names beyond audit logs you opt into</li>
        </ul>
        <h2 className="mt-8 text-xl font-semibold">What we do retain</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>• Account profile and workspace membership</li>
          <li>• Cryptographic hashes for chain of custody</li>
          <li>• Report summaries when you choose to save them</li>
          <li>• Audit logs of actions performed by signed-in users</li>
        </ul>
        <h2 className="mt-8 text-xl font-semibold">Your rights</h2>
        <p className="mt-2 text-sm text-muted-foreground">Export and delete all account data at any time. We honor GDPR, UK GDPR, CCPA, and HIPAA rights with a single-click data request.</p>
      </div>
    </PublicPage>
  );
}