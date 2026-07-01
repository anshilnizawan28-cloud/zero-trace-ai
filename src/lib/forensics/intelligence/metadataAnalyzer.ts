import type { DocMetadata } from "../types";

export interface MetadataFinding {
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
}

export interface MetadataAnalysis {
  score: number;
  findings: MetadataFinding[];
}

export function analyzeMetadata(
  metadata: DocMetadata,
): MetadataAnalysis {

  const findings: MetadataFinding[] = [];

  let score = 100;

  if (!metadata.author) {
    score -= 5;

    findings.push({
      severity: "warning",
      title: "Author Missing",
      description: "Document author metadata is empty.",
    });
  }

  if (!metadata.creator) {
    score -= 10;

    findings.push({
      severity: "warning",
      title: "Creator Missing",
      description: "Creator application is unavailable.",
    });
  }

  if (!metadata.producer) {
    score -= 10;

    findings.push({
      severity: "warning",
      title: "Producer Missing",
      description: "PDF producer metadata is missing.",
    });
  }

  if (
    metadata.createdDate &&
    metadata.modifiedDate &&
    new Date(metadata.modifiedDate) <
      new Date(metadata.createdDate)
  ) {
    score -= 25;

    findings.push({
      severity: "critical",
      title: "Timeline Inconsistency",
      description:
        "Modification date occurs before creation date.",
    });
  }

  return {
    score: Math.max(score, 0),
    findings,
  };
}
