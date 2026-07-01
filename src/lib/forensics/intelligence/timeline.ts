import type { DocMetadata } from "../types";

export interface TimelineEvent {
  date: string;
  title: string;
}

export function buildTimeline(
  metadata: DocMetadata,
): TimelineEvent[] {

  const events: TimelineEvent[] = [];

  if (metadata.createdDate) {
    events.push({
      date: metadata.createdDate,
      title: "Document Created",
    });
  }

  if (metadata.modifiedDate) {
    events.push({
      date: metadata.modifiedDate,
      title: "Document Modified",
    });
  }

  return events.sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime(),
  );
}
