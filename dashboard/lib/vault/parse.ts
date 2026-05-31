import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { PageNaming, VaultConfig } from "./types";
import { slugify } from "./links";

export interface ParsedPage {
  path: string;
  relPath: string;
  folder: string;
  slug: string;
  title: string;
  frontmatter: Record<string, unknown>;
  body: string;
  excerpt: string;
  mtime: string; // ISO
}

function deslug(basename: string, naming: PageNaming): string {
  const words = basename.replace(/[-_]+/g, " ").trim();
  switch (naming) {
    case "kebab-case":
    case "title-case":
      return words.replace(/\b\w/g, (c) => c.toUpperCase());
    case "sentence-case":
    default:
      return words.charAt(0).toUpperCase() + words.slice(1);
  }
}

function firstH1(body: string): string | undefined {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m?.[1]?.trim();
}

// Strip the lightest markdown so excerpts read as plain prose.
function makeExcerpt(body: string, limit = 200): string {
  const text = body
    .replace(/^#.*$/gm, "") // headings
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a) // wikilinks
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // md links
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > limit ? text.slice(0, limit).trimEnd() + "…" : text;
}

export async function parsePage(
  file: { path: string; relPath: string },
  config: VaultConfig,
): Promise<ParsedPage> {
  const rawText = await fs.readFile(file.path, "utf8");
  const stat = await fs.stat(file.path);

  // gray-matter tolerates files with no frontmatter (returns data: {}).
  let frontmatter: Record<string, unknown> = {};
  let body = rawText;
  try {
    const parsed = matter(rawText);
    frontmatter = (parsed.data ?? {}) as Record<string, unknown>;
    body = parsed.content ?? "";
  } catch {
    // Malformed YAML — fall back to treating the whole file as body.
    body = rawText;
  }

  const basename = path.basename(file.relPath, ".md");
  const folder = path.dirname(file.relPath).split("/").pop() ?? "";
  const slug = slugify(basename);

  const fmTitle = typeof frontmatter.title === "string" ? frontmatter.title.trim() : undefined;
  const title = fmTitle || firstH1(body) || deslug(basename, config.wiki.pageNaming);

  return {
    path: file.path,
    relPath: file.relPath,
    folder,
    slug,
    title,
    frontmatter,
    body,
    excerpt: makeExcerpt(body),
    mtime: stat.mtime.toISOString(),
  };
}
