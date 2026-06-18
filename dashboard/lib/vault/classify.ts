import type { ParsedPage } from "./parse";
import type { Page, Role, VaultConfig } from "./types";
import { adapter, normalizeStatus, ROLE_PRECEDENCE } from "./adapter";
import { extractBodyLinks, toLinkRefs, toSingleLinkRef } from "./links";
import { daysBetween, toISODate } from "./format";

export const STALE_DAYS = 30;

const RELATIONSHIP_STRENGTH: Record<string, 0 | 1 | 2 | 3> = {
  strong: 3,
  close: 3,
  warm: 2,
  good: 2,
  weak: 1,
  cold: 1,
  new: 0,
};

function fmString(fm: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = fm[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

interface RoleResult {
  role: Role;
  reason: string;
}

function classifyRole(parsed: ParsedPage): RoleResult {
  const fmType = fmString(parsed.frontmatter, "type")?.toLowerCase();
  const folder = parsed.folder.toLowerCase();
  const basename = parsed.relPath.split("/").pop()?.replace(/\.md$/i, "") ?? "";

  // 1. Explicit frontmatter `type:` (strongest signal).
  if (fmType) {
    for (const role of ROLE_PRECEDENCE) {
      if (adapter.rules[role].typeAliases.includes(fmType)) {
        return { role, reason: `type: ${fmType}` };
      }
    }
  }

  // 2. Containing folder name.
  for (const role of ROLE_PRECEDENCE) {
    if (adapter.rules[role].folders.includes(folder)) {
      return { role, reason: `folder: ${folder}/` };
    }
  }

  // 3. Filename patterns (e.g. date-prefixed activity logs).
  for (const role of ROLE_PRECEDENCE) {
    if (adapter.rules[role].filenamePatterns.some((re) => re.test(basename))) {
      return { role, reason: `filename pattern (${basename})` };
    }
  }

  // 4. Body heuristics (last resort before the generic bucket).
  if (/^#{1,3}\s*commitments?\b/im.test(parsed.body) || /\bdue:\s*\S/i.test(parsed.body)) {
    return { role: "commitment", reason: "body mentions a due date / commitments" };
  }

  // 5. Fallback.
  return { role: "note", reason: "no role signal — generic note" };
}

export function classify(parsed: ParsedPage, _config: VaultConfig, now: Date): Page {
  const { role, reason } = classifyRole(parsed);
  const fm = parsed.frontmatter;
  const derived: string[] = [];
  if (reason) derived.push(`role from ${reason}`);

  const updated = toISODate(fm.updated) ?? toISODate(fm.modified);
  const fmDate =
    toISODate(fm.date) ?? toISODate(fm.last_contact) ?? toISODate(fm.due) ?? toISODate(fm.created);

  // Best chronological field, falling back to file mtime.
  let date = fmDate ?? updated;
  if (!date) {
    date = parsed.mtime.slice(0, 10);
    derived.push("date derived from file modified time");
  }

  const rawStatus = fmString(fm, "status");
  const status = normalizeStatus(rawStatus);
  if (!rawStatus && (role === "project" || role === "commitment")) {
    derived.push("status unknown (no frontmatter status)");
  }

  const outLinks = extractBodyLinks(parsed.body);

  const base = {
    id: parsed.relPath,
    slug: parsed.slug,
    title: parsed.title,
    path: parsed.path,
    relPath: parsed.relPath,
    folder: parsed.folder,
    updated: updated ?? (role === "project" ? parsed.mtime.slice(0, 10) : undefined),
    date,
    status,
    rawFrontmatter: fm,
    body: parsed.body,
    excerpt: parsed.excerpt,
    outLinks,
    backlinks: [] as string[],
    derived,
  };

  switch (role) {
    case "project":
      return {
        ...base,
        role,
        next: fmString(fm, "next", "next_step", "nextstep"),
        owner: toSingleLinkRef(fm.owner),
      };
    case "person": {
      const relationship = fmString(fm, "relationship", "tier");
      const lastContact = toISODate(fm.last_contact) ?? toISODate(fm.last_contacted);
      const days = daysBetween(lastContact, now);
      return {
        ...base,
        role,
        org: toSingleLinkRef(fm.org ?? fm.organization ?? fm.company),
        relationship,
        relationshipStrength: relationship
          ? RELATIONSHIP_STRENGTH[relationship.toLowerCase()]
          : undefined,
        lastContact,
        personRole: fmString(fm, "role", "title"),
        stale: days != null ? days > STALE_DAYS : undefined,
      };
    }
    case "org":
      return {
        ...base,
        role,
        domain: fmString(fm, "domain", "website"),
        lastTouchpoint:
          toISODate(fm.last_touchpoint) ?? toISODate(fm.last_contact) ?? fmDate,
      };
    case "commitment": {
      const due = toISODate(fm.due) ?? toISODate(fm.due_date) ?? toISODate(fm.deadline);
      const days = daysBetween(due, now);
      const isOverdue = days != null && days > 0 && status !== "done";
      return {
        ...base,
        role,
        owner: toSingleLinkRef(fm.owner ?? fm.assignee),
        due,
        source: fmString(fm, "source", "from"),
        isOverdue,
      };
    }
    case "activity":
      return {
        ...base,
        role,
        kind: fmString(fm, "kind", "type") === role ? undefined : fmString(fm, "kind"),
        participants: toLinkRefs(fm.participants ?? fm.attendees ?? fm.with),
      };
    case "theme":
      return { ...base, role };
    case "research":
      return {
        ...base,
        role,
        sourceUrl: fmString(fm, "source_url", "url", "link"),
        authors: toLinkRefs(fm.authors ?? fm.author),
      };
    default:
      return { ...base, role: "note" };
  }
}
