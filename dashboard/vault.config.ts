// ──────────────────────────────────────────────────────────────────────────
// Adapt the dashboard to YOUR vault here.
//
// The dashboard classifies every markdown page into one of 7 roles:
//   project · person · org · commitment · activity · theme · research
// It already understands common conventions (a `type:` in frontmatter, a
// `people/` folder, date-prefixed filenames, etc.). If your vault uses
// different words or folder names, add them below — these are MERGED with the
// built-in defaults, so you only list your extras.
//
// Visit /debug in the running app to see how each page was classified and
// which of your .second-brain.json entityTypes did not map to a role.
// ──────────────────────────────────────────────────────────────────────────

import type { Role } from "@/lib/vault/types";

export interface AdapterOverrides {
  rules?: Partial<
    Record<
      Exclude<Role, "note">,
      {
        typeAliases?: string[];
        folders?: string[];
        filenamePatterns?: RegExp[];
      }
    >
  >;
  // Normalize your status words into the dashboard vocabulary, e.g.
  // { "shipping": "active", "icebox": "paused" }
  statusSynonyms?: Record<string, string>;
  // Force a .second-brain.json entityType to a specific role, e.g.
  // { "clients": "org", "deliverables": "project" }
  entityTypeRoles?: Record<string, Role>;
}

export const adapterOverrides: AdapterOverrides = {
  rules: {
    // Example: if your projects live in an "initiatives/" folder and you tag
    // them `type: workstream`, you would write:
    // project: { folders: ["initiatives"], typeAliases: ["workstream"] },
  },
  statusSynonyms: {},
  entityTypeRoles: {},
};
