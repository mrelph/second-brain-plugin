import { promises as fs } from "node:fs";
import path from "node:path";
import type { LinkStyle, PageNaming, VaultConfig } from "./types";

const VALID_LINK_STYLES: LinkStyle[] = ["wikilinks", "markdown"];
const VALID_PAGE_NAMING: PageNaming[] = ["title-case", "kebab-case", "sentence-case"];

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

// Read and normalize `.second-brain.json`. If it is missing or malformed we
// synthesize a usable default so the dashboard still runs on a plain folder of
// markdown — every gap is recorded in `warnings`.
export async function loadConfig(
  vaultPath: string,
): Promise<{ config: VaultConfig; warnings: string[] }> {
  const warnings: string[] = [];
  const configPath = path.join(vaultPath, ".second-brain.json");

  let raw: Record<string, unknown> = {};
  try {
    const text = await fs.readFile(configPath, "utf8");
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      warnings.push(
        "No .second-brain.json found in the vault — using default config. Entity types will be inferred from folders and frontmatter.",
      );
    } else {
      warnings.push(`Could not parse .second-brain.json: ${(err as Error).message}. Using defaults.`);
    }
  }

  const rawSchema = (raw.schema ?? {}) as Record<string, unknown>;
  const rawWiki = (raw.wiki ?? {}) as Record<string, unknown>;

  const linkStyle = VALID_LINK_STYLES.includes(rawWiki.linkStyle as LinkStyle)
    ? (rawWiki.linkStyle as LinkStyle)
    : "wikilinks";
  const pageNaming = VALID_PAGE_NAMING.includes(rawWiki.pageNaming as PageNaming)
    ? (rawWiki.pageNaming as PageNaming)
    : "title-case";
  const frontmatter = typeof rawWiki.frontmatter === "boolean" ? rawWiki.frontmatter : true;

  if (frontmatter === false) {
    warnings.push(
      "Vault config has frontmatter disabled — most fields will be derived from folders, filenames, and page bodies.",
    );
  }

  const config: VaultConfig = {
    projectName: typeof raw.projectName === "string" ? raw.projectName : "Second Brain",
    categories: asStringArray(raw.categories),
    schema: {
      domain: typeof rawSchema.domain === "string" ? rawSchema.domain : undefined,
      entityTypes: asStringArray(rawSchema.entityTypes),
      commonQueries: asStringArray(rawSchema.commonQueries),
      styleGuide: typeof rawSchema.styleGuide === "string" ? rawSchema.styleGuide : undefined,
    },
    wiki: { linkStyle, frontmatter, pageNaming },
  };

  return { config, warnings };
}
