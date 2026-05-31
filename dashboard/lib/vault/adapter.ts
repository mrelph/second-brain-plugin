// The adapter is the single place that maps the 7 dashboard roles onto whatever
// a particular vault actually uses. Nothing else in the codebase hardcodes role
// assumptions. Users adapt the dashboard to their real vault by editing
// `vault.config.ts` at the dashboard root, which is merged in here.

import type { Role } from "./types";
import { adapterOverrides } from "@/vault.config";

export interface RoleRule {
  // Frontmatter `type:` values that map to this role (lowercased).
  typeAliases: string[];
  // Folder names (any path segment) that imply this role (lowercased).
  folders: string[];
  // Filename patterns (tested against the basename without extension).
  filenamePatterns: RegExp[];
}

export interface Adapter {
  rules: Record<Exclude<Role, "note">, RoleRule>;
  statusSynonyms: Record<string, string>;
  // Explicit entityType (from .second-brain.json) -> role overrides.
  entityTypeRoles: Record<string, Role>;
}

// Order matters for classification: the first role whose rule matches wins.
export const ROLE_PRECEDENCE: Exclude<Role, "note">[] = [
  "commitment",
  "activity",
  "project",
  "person",
  "org",
  "research",
  "theme",
];

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

const DEFAULT_RULES: Record<Exclude<Role, "note">, RoleRule> = {
  project: {
    typeAliases: ["project", "initiative", "effort"],
    folders: ["projects", "project"],
    filenamePatterns: [],
  },
  person: {
    typeAliases: ["person", "people", "contact", "individual"],
    folders: ["people", "persons", "contacts"],
    filenamePatterns: [],
  },
  org: {
    typeAliases: ["org", "organization", "organisation", "company", "account"],
    folders: ["orgs", "org", "organizations", "organisations", "companies", "accounts"],
    filenamePatterns: [],
  },
  commitment: {
    typeAliases: ["commitment", "todo", "task", "action", "action-item", "actionitem"],
    folders: ["commitments", "todos", "tasks", "actions", "action-items"],
    filenamePatterns: [],
  },
  activity: {
    // Date-prefixed filenames are a strong activity signal (meeting/call logs).
    typeAliases: ["activity", "event", "log", "interaction", "meeting", "call", "note-log"],
    folders: ["activities", "activity", "events", "log", "logs", "interactions", "meetings"],
    filenamePatterns: [DATE_PREFIX],
  },
  theme: {
    typeAliases: ["theme", "topic"],
    folders: ["themes", "theme", "topics"],
    filenamePatterns: [],
  },
  research: {
    typeAliases: ["research", "paper", "source", "reference", "article", "study"],
    folders: ["research", "papers", "sources", "references", "literature"],
    filenamePatterns: [],
  },
};

// Normalize free-text status values into a small, predictable vocabulary.
const DEFAULT_STATUS_SYNONYMS: Record<string, string> = {
  // active-ish
  active: "active",
  "in-progress": "active",
  "in progress": "active",
  ongoing: "active",
  wip: "active",
  open: "open",
  // blocked-ish
  blocked: "blocked",
  stuck: "blocked",
  "on-hold": "paused",
  "on hold": "paused",
  paused: "paused",
  // done-ish
  done: "done",
  complete: "done",
  completed: "done",
  closed: "done",
  shipped: "done",
  finished: "done",
  // research statuses
  "to-read": "to-read",
  "to read": "to-read",
  unread: "to-read",
  reading: "reading",
  read: "read",
  // theme statuses
  emerging: "emerging",
  dormant: "dormant",
};

// Fuzzy-map a .second-brain.json entityType (a user-defined plural) to a role.
// Singularize naively and look it up against each role's type aliases / folders.
function fuzzyEntityTypeRole(entityType: string): Role | null {
  const t = entityType.trim().toLowerCase();
  if (!t) return null;
  const singular = t.endsWith("ies")
    ? t.slice(0, -3) + "y"
    : t.endsWith("s")
      ? t.slice(0, -1)
      : t;
  for (const role of ROLE_PRECEDENCE) {
    const rule = DEFAULT_RULES[role];
    if (
      rule.typeAliases.includes(t) ||
      rule.typeAliases.includes(singular) ||
      rule.folders.includes(t)
    ) {
      return role;
    }
  }
  return null;
}

function lc(arr: string[] | undefined): string[] {
  return (arr ?? []).map((s) => s.toLowerCase());
}

// Merge built-in defaults with user overrides from vault.config.ts.
function buildAdapter(): Adapter {
  const rules: Record<Exclude<Role, "note">, RoleRule> = {} as never;
  for (const role of ROLE_PRECEDENCE) {
    const base = DEFAULT_RULES[role];
    const override = adapterOverrides.rules?.[role];
    rules[role] = {
      typeAliases: [...base.typeAliases, ...lc(override?.typeAliases)],
      folders: [...base.folders, ...lc(override?.folders)],
      filenamePatterns: [...base.filenamePatterns, ...(override?.filenamePatterns ?? [])],
    };
  }

  const statusSynonyms = { ...DEFAULT_STATUS_SYNONYMS };
  for (const [k, v] of Object.entries(adapterOverrides.statusSynonyms ?? {})) {
    statusSynonyms[k.toLowerCase()] = v;
  }

  const entityTypeRoles: Record<string, Role> = {};
  for (const [k, v] of Object.entries(adapterOverrides.entityTypeRoles ?? {})) {
    entityTypeRoles[k.toLowerCase()] = v;
  }

  return { rules, statusSynonyms, entityTypeRoles };
}

export const adapter: Adapter = buildAdapter();

export function normalizeStatus(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const key = String(raw).trim().toLowerCase();
  return adapter.statusSynonyms[key] ?? key;
}

// Resolve an entityType to a role: explicit override first, then fuzzy match.
export function entityTypeToRole(entityType: string): Role | null {
  const key = entityType.trim().toLowerCase();
  if (adapter.entityTypeRoles[key]) return adapter.entityTypeRoles[key];
  return fuzzyEntityTypeRole(entityType);
}
