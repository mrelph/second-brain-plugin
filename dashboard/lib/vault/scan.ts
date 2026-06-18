import path from "node:path";
import { globby } from "globby";

// Markdown files we never treat as wiki pages (assistant instruction stubs).
const IGNORED_BASENAMES = new Set(["CLAUDE.md", "AGENTS.md", "README.md"]);

export interface ScannedFile {
  path: string; // absolute
  relPath: string; // vault-relative, posix separators
}

// Discover every markdown page under the vault, ignoring tooling files.
export async function scanFiles(vaultPath: string): Promise<ScannedFile[]> {
  const matches = await globby("**/*.md", {
    cwd: vaultPath,
    absolute: false,
    dot: false,
    ignore: [
      "**/node_modules/**",
      "**/.git/**",
      "**/.next/**",
    ],
  });

  return matches
    .filter((rel) => !IGNORED_BASENAMES.has(path.basename(rel)))
    .map((rel) => ({
      path: path.join(vaultPath, rel),
      relPath: rel.split(path.sep).join("/"),
    }));
}
