import type { LinkRef } from "./types";

// Canonical join key. `[[Acme Corp]]`, `acme-corp.md`, and a file named
// `Acme Corp.md` must all collapse to the same slug so links resolve.
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/\.md$/i, "")
    .replace(/^.*\//, "") // drop any path prefix on link targets
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
// Markdown links whose target looks like a local page (ends in .md or has no
// scheme/anchor). External http(s) links are intentionally ignored.
const MARKDOWN_LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

function isLocalTarget(target: string): boolean {
  const t = target.trim();
  if (!t) return false;
  if (/^[a-z]+:\/\//i.test(t)) return false; // http://, https://, mailto: etc.
  if (t.startsWith("#")) return false; // pure anchor
  return t.endsWith(".md") || !t.includes(".");
}

function dedupe(refs: LinkRef[]): LinkRef[] {
  const seen = new Set<string>();
  const out: LinkRef[] = [];
  for (const ref of refs) {
    if (ref.slug && !seen.has(ref.slug)) {
      seen.add(ref.slug);
      out.push(ref);
    }
  }
  return out;
}

// Extract links from a page body, defensively parsing BOTH styles regardless of
// the vault's declared linkStyle (vaults are rarely perfectly consistent).
export function extractBodyLinks(body: string): LinkRef[] {
  const refs: LinkRef[] = [];

  for (const m of body.matchAll(WIKILINK_RE)) {
    const rawTarget = m[1].trim();
    refs.push({ rawTarget, slug: slugify(rawTarget) });
  }
  for (const m of body.matchAll(MARKDOWN_LINK_RE)) {
    const rawTarget = m[1].trim();
    if (isLocalTarget(rawTarget)) {
      refs.push({ rawTarget, slug: slugify(rawTarget) });
    }
  }

  return dedupe(refs);
}

// Turn a frontmatter value (string, `[[wikilink]]`, or array of either) into
// LinkRefs. Strips wikilink/markdown syntax if present.
export function toLinkRefs(value: unknown): LinkRef[] {
  if (value == null) return [];
  const items = Array.isArray(value) ? value : [value];
  const refs: LinkRef[] = [];
  for (const item of items) {
    if (typeof item !== "string") continue;
    const wiki = item.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    const md = item.match(/\[[^\]]*\]\(([^)]+)\)/);
    const rawTarget = (wiki?.[1] ?? md?.[1] ?? item).trim();
    if (!rawTarget) continue;
    refs.push({ rawTarget: rawTarget.replace(/\.md$/i, ""), slug: slugify(rawTarget) });
  }
  return dedupe(refs);
}

export function toSingleLinkRef(value: unknown): LinkRef | undefined {
  return toLinkRefs(value)[0];
}
