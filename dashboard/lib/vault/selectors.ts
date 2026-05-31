import type {
  ActivityPage,
  CommitmentPage,
  OrgPage,
  Page,
  PersonPage,
  ProjectPage,
  ResearchPage,
  ThemePage,
  VaultData,
} from "./types";

export const projects = (v: VaultData) => v.byRole.project as ProjectPage[];
export const people = (v: VaultData) => v.byRole.person as PersonPage[];
export const orgs = (v: VaultData) => v.byRole.org as OrgPage[];
export const commitments = (v: VaultData) => v.byRole.commitment as CommitmentPage[];
export const activities = (v: VaultData) => v.byRole.activity as ActivityPage[];
export const themes = (v: VaultData) => v.byRole.theme as ThemePage[];
export const research = (v: VaultData) => v.byRole.research as ResearchPage[];

export function pageBySlug<T extends Page = Page>(
  v: VaultData,
  slug: string,
  role?: Page["role"],
): T | undefined {
  const page = v.bySlug[slug];
  if (!page) return undefined;
  if (role && page.role !== role) return undefined;
  return page as T;
}

// ── Home-page aggregations ────────────────────────────────────────────────

export const blockedProjects = (v: VaultData) =>
  projects(v).filter((p) => p.status === "blocked");

export const activeProjects = (v: VaultData) =>
  projects(v).filter((p) => p.status === "active");

export const overdueCommitments = (v: VaultData) =>
  commitments(v).filter((c) => c.isOverdue);

export const openCommitments = (v: VaultData) =>
  commitments(v).filter((c) => c.status !== "done");

export const staleContacts = (v: VaultData) =>
  people(v).filter((p) => p.stale);

export const toReadResearch = (v: VaultData) =>
  research(v).filter((r) => r.status === "to-read");

// Themes ranked by how many pages link to them (backlink count).
export function themesByLinkCount(v: VaultData): { theme: ThemePage; count: number }[] {
  return themes(v)
    .map((theme) => ({ theme, count: theme.backlinks.length }))
    .sort((a, b) => b.count - a.count);
}
