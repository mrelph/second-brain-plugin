import { describe, expect, it } from "vitest";
import { classify } from "@/lib/vault/classify";
import type { ParsedPage } from "@/lib/vault/parse";
import type { CommitmentPage, PersonPage, VaultConfig } from "@/lib/vault/types";

const config: VaultConfig = {
  projectName: "Test",
  categories: [],
  schema: { entityTypes: [] },
  wiki: { linkStyle: "wikilinks", frontmatter: true, pageNaming: "title-case" },
};

const NOW = new Date("2026-05-31T00:00:00Z");

function parsed(overrides: Partial<ParsedPage>): ParsedPage {
  return {
    path: "/x/" + (overrides.relPath ?? "page.md"),
    relPath: overrides.relPath ?? "page.md",
    folder: overrides.folder ?? "",
    slug: overrides.slug ?? "page",
    title: overrides.title ?? "Page",
    frontmatter: overrides.frontmatter ?? {},
    body: overrides.body ?? "",
    excerpt: overrides.excerpt ?? "",
    mtime: overrides.mtime ?? "2026-01-01T00:00:00.000Z",
  };
}

describe("classify role", () => {
  it("classifies from frontmatter type aliases", () => {
    expect(classify(parsed({ frontmatter: { type: "organization" } }), config, NOW).role).toBe("org");
    expect(classify(parsed({ frontmatter: { type: "paper" } }), config, NOW).role).toBe("research");
  });

  it("classifies from folder when frontmatter is absent", () => {
    const page = classify(parsed({ folder: "projects", relPath: "projects/Legacy Cleanup.md" }), config, NOW);
    expect(page.role).toBe("project");
    expect(page.derived.join(" ")).toMatch(/folder/);
  });

  it("classifies date-prefixed filenames as activity", () => {
    const page = classify(parsed({ relPath: "2026-05-28 Acme Sync.md" }), config, NOW);
    expect(page.role).toBe("activity");
  });

  it("falls back to note when there is no signal", () => {
    expect(classify(parsed({ relPath: "sources/inbox/dump.md" }), config, NOW).role).toBe("note");
  });
});

describe("classify derived fields", () => {
  it("derives overdue commitments against now", () => {
    const overdue = classify(
      parsed({ frontmatter: { type: "commitment", due: "2026-05-15", status: "open" } }),
      config,
      NOW,
    ) as CommitmentPage;
    expect(overdue.isOverdue).toBe(true);

    const future = classify(
      parsed({ frontmatter: { type: "commitment", due: "2026-06-15", status: "open" } }),
      config,
      NOW,
    ) as CommitmentPage;
    expect(future.isOverdue).toBe(false);

    const done = classify(
      parsed({ frontmatter: { type: "commitment", due: "2026-05-15", status: "done" } }),
      config,
      NOW,
    ) as CommitmentPage;
    expect(done.isOverdue).toBe(false);
  });

  it("flags stale contacts and maps relationship strength", () => {
    const stale = classify(
      parsed({ frontmatter: { type: "person", relationship: "weak", last_contact: "2026-03-01" } }),
      config,
      NOW,
    ) as PersonPage;
    expect(stale.stale).toBe(true);
    expect(stale.relationshipStrength).toBe(1);

    const fresh = classify(
      parsed({ frontmatter: { type: "person", relationship: "strong", last_contact: "2026-05-25" } }),
      config,
      NOW,
    ) as PersonPage;
    expect(fresh.stale).toBe(false);
    expect(fresh.relationshipStrength).toBe(3);
  });

  it("normalizes status synonyms", () => {
    const page = classify(parsed({ frontmatter: { type: "project", status: "in progress" } }), config, NOW);
    expect(page.status).toBe("active");
  });
});
