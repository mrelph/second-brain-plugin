import { describe, expect, it } from "vitest";
import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";
import { parsePage } from "@/lib/vault/parse";
import type { VaultConfig } from "@/lib/vault/types";

const config: VaultConfig = {
  projectName: "Test",
  categories: [],
  schema: { entityTypes: [] },
  wiki: { linkStyle: "wikilinks", frontmatter: true, pageNaming: "title-case" },
};

async function tmpFile(name: string, content: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-parse-"));
  const file = path.join(dir, name);
  await fs.writeFile(file, content, "utf8");
  return { path: file, relPath: name };
}

describe("parsePage", () => {
  it("parses frontmatter and body", async () => {
    const file = await tmpFile(
      "Project Phoenix.md",
      "---\ntype: project\nstatus: active\n---\n# Project Phoenix\n\nBody text.",
    );
    const parsed = await parsePage(file, config);
    expect(parsed.frontmatter.type).toBe("project");
    expect(parsed.title).toBe("Project Phoenix");
    expect(parsed.slug).toBe("project-phoenix");
    expect(parsed.excerpt).toContain("Body text");
  });

  it("degrades gracefully with no frontmatter (title from H1, then filename)", async () => {
    const fromH1 = await tmpFile("legacy-cleanup.md", "# Legacy Cleanup\n\nNotes.");
    const p1 = await parsePage(fromH1, config);
    expect(p1.frontmatter).toEqual({});
    expect(p1.title).toBe("Legacy Cleanup");

    const fromName = await tmpFile("some-old-note.md", "Just prose, no heading.");
    const p2 = await parsePage(fromName, config);
    expect(p2.title).toBe("Some Old Note");
  });

  it("does not throw on malformed yaml", async () => {
    const file = await tmpFile("bad.md", "---\n: : : bad\n---\nbody");
    await expect(parsePage(file, config)).resolves.toBeTruthy();
  });
});
