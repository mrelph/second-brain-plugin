// Core data model for the second-brain dashboard.
// All parsing happens server-side; these types describe the in-memory index
// that Server Components read from.

export type Role =
  | "project"
  | "person"
  | "org"
  | "commitment"
  | "activity"
  | "theme"
  | "research"
  | "note";

export const ROLES: Role[] = [
  "project",
  "person",
  "org",
  "commitment",
  "activity",
  "theme",
  "research",
  "note",
];

export type LinkStyle = "wikilinks" | "markdown";
export type PageNaming = "title-case" | "kebab-case" | "sentence-case";

export interface VaultConfig {
  projectName: string;
  categories: string[];
  schema: {
    domain?: string;
    entityTypes: string[];
    commonQueries?: string[];
    styleGuide?: string;
  };
  wiki: {
    linkStyle: LinkStyle;
    frontmatter: boolean;
    pageNaming: PageNaming;
  };
}

// A link discovered in a frontmatter field or the page body. `slug` is the
// normalized join key; `resolvedId` is filled in once the index is built (or
// left undefined for a "dangling" link to a page that does not exist).
export interface LinkRef {
  rawTarget: string;
  slug: string;
  resolvedId?: string;
}

export interface PageBase {
  id: string; // stable id, currently the vault-relative path
  slug: string;
  title: string;
  role: Role;
  path: string; // absolute path on disk
  relPath: string; // vault-relative path (for display)
  folder: string; // immediate parent folder name
  updated?: string; // ISO date, best-derived
  date?: string; // ISO date, primary chronological field for the role
  status?: string; // normalized status, when applicable
  rawFrontmatter: Record<string, unknown>;
  body: string;
  excerpt: string;
  outLinks: LinkRef[];
  backlinks: string[]; // page ids that link to this page
  derived: string[]; // human-readable notes about what was inferred and why
}

export interface ProjectPage extends PageBase {
  role: "project";
  next?: string;
  owner?: LinkRef;
}

export interface PersonPage extends PageBase {
  role: "person";
  org?: LinkRef;
  relationship?: string;
  relationshipStrength?: 0 | 1 | 2 | 3;
  lastContact?: string;
  personRole?: string; // their job title / role, distinct from the dashboard Role
  stale?: boolean; // last contact older than the stale threshold
}

export interface OrgPage extends PageBase {
  role: "org";
  domain?: string;
  lastTouchpoint?: string;
}

export interface CommitmentPage extends PageBase {
  role: "commitment";
  owner?: LinkRef;
  due?: string;
  source?: string;
  isOverdue: boolean;
}

export interface ActivityPage extends PageBase {
  role: "activity";
  kind?: string;
  participants: LinkRef[];
}

export interface ThemePage extends PageBase {
  role: "theme";
}

export interface ResearchPage extends PageBase {
  role: "research";
  sourceUrl?: string;
  authors: LinkRef[];
}

export interface NotePage extends PageBase {
  role: "note";
}

export type Page =
  | ProjectPage
  | PersonPage
  | OrgPage
  | CommitmentPage
  | ActivityPage
  | ThemePage
  | ResearchPage
  | NotePage;

export type RelationshipKind =
  | "owner"
  | "org"
  | "participant"
  | "author"
  | "mention"
  | "link";

export interface RelationshipEdge {
  from: string; // page id
  to: string; // page id
  kind: RelationshipKind;
}

export interface TimelineEntry {
  date: string; // ISO date
  pageId: string;
  title: string;
  role: Role;
  kind: string; // "activity" | "updated" | "commitment-due" | ...
  summary: string;
}

export interface VaultData {
  config: VaultConfig;
  vaultPath: string;
  usingSampleVault: boolean;
  pages: Page[];
  byId: Record<string, Page>;
  bySlug: Record<string, Page>;
  byRole: Record<Role, Page[]>;
  edges: RelationshipEdge[];
  timeline: TimelineEntry[]; // sorted desc by date
  warnings: string[];
  unmatchedEntityTypes: string[];
}
