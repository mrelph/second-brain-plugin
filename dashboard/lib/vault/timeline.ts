import type { Page, TimelineEntry } from "./types";

// Build a reverse-chronological feed. Activities are the backbone; we also fold
// in commitment due dates and recent project updates so the timeline reflects
// everything time-stamped in the vault.
export function buildTimeline(pages: Page[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const page of pages) {
    if (page.role === "activity" && page.date) {
      entries.push({
        date: page.date,
        pageId: page.id,
        title: page.title,
        role: page.role,
        kind: page.kind ?? "activity",
        summary: page.excerpt,
      });
    } else if (page.role === "commitment" && page.due) {
      entries.push({
        date: page.due,
        pageId: page.id,
        title: page.title,
        role: page.role,
        kind: "commitment-due",
        summary: page.status ? `Due · ${page.status}` : "Due",
      });
    } else if (page.role === "project" && page.updated) {
      entries.push({
        date: page.updated,
        pageId: page.id,
        title: page.title,
        role: page.role,
        kind: "project-update",
        summary: page.next ? `Next: ${page.next}` : (page.status ?? ""),
      });
    }
  }

  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
