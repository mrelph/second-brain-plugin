import type {
  Page,
  RelationshipEdge,
  RelationshipKind,
  Role,
} from "./types";
import { ROLES } from "./types";

export interface BuiltIndex {
  byId: Record<string, Page>;
  bySlug: Record<string, Page>;
  byRole: Record<Role, Page[]>;
  edges: RelationshipEdge[];
}

function emptyByRole(): Record<Role, Page[]> {
  return ROLES.reduce(
    (acc, role) => {
      acc[role] = [];
      return acc;
    },
    {} as Record<Role, Page[]>,
  );
}

// Resolve link targets to page ids, populate backlinks, and emit typed edges.
export function buildIndex(pages: Page[]): BuiltIndex {
  const byId: Record<string, Page> = {};
  const bySlug: Record<string, Page> = {};
  const byRole = emptyByRole();

  // First pass: id + slug maps. On slug collision the first page wins, which is
  // fine — links resolve to a canonical page and the duplicate stays addressable
  // by id.
  for (const page of pages) {
    byId[page.id] = page;
    if (!bySlug[page.slug]) bySlug[page.slug] = page;
  }

  const edges: RelationshipEdge[] = [];
  const addEdge = (from: string, toSlug: string | undefined, kind: RelationshipKind) => {
    if (!toSlug) return;
    const target = bySlug[toSlug];
    if (!target || target.id === from) return;
    edges.push({ from, to: target.id, kind });
  };

  // Second pass: resolve links, backlinks, typed relationship edges.
  for (const page of pages) {
    for (const link of page.outLinks) {
      const target = bySlug[link.slug];
      if (target) {
        link.resolvedId = target.id;
        if (!target.backlinks.includes(page.id)) target.backlinks.push(page.id);
      }
    }

    // Typed edges from structured frontmatter fields.
    switch (page.role) {
      case "project":
        addEdge(page.id, page.owner?.slug, "owner");
        break;
      case "person":
        addEdge(page.id, page.org?.slug, "org");
        break;
      case "commitment":
        addEdge(page.id, page.owner?.slug, "owner");
        break;
      case "activity":
        for (const p of page.participants) addEdge(page.id, p.slug, "participant");
        break;
      case "research":
        for (const a of page.authors) addEdge(page.id, a.slug, "author");
        break;
      default:
        break;
    }

    // Generic mention edges from body links (deduped against typed edges later
    // is unnecessary — consumers filter by `kind`).
    for (const link of page.outLinks) {
      if (link.resolvedId) {
        edges.push({ from: page.id, to: link.resolvedId, kind: "mention" });
      }
    }
  }

  for (const page of pages) {
    byRole[page.role].push(page);
  }

  return { byId, bySlug, byRole, edges };
}
