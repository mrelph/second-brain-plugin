import type { Page, Role } from "./vault/types";

// Roles that have a detail page. Others (commitment, activity, note) appear only
// in their list views, so links to them render as plain text.
const DETAIL_ROUTES: Partial<Record<Role, string>> = {
  project: "/projects",
  person: "/people",
  org: "/orgs",
  theme: "/themes",
  research: "/research",
};

export function hrefForPage(page: Pick<Page, "role" | "slug">): string | null {
  const base = DETAIL_ROUTES[page.role];
  return base ? `${base}/${page.slug}` : null;
}

export const LIST_ROUTES: Record<Exclude<Role, "note">, string> = {
  project: "/projects",
  person: "/people",
  org: "/orgs",
  commitment: "/commitments",
  activity: "/activities",
  theme: "/themes",
  research: "/research",
};
