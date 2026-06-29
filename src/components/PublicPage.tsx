import type { ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PrivacyBadge } from "@/components/PrivacyBadge";

export function PublicPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl space-y-4">
            <PrivacyBadge compact />
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="text-pretty text-base text-muted-foreground sm:text-lg">{description}</p>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-6 py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}