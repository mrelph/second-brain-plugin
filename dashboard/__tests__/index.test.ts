import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { buildVaultData } from "@/lib/vault/load";
import type { VaultData } from "@/lib/vault/types";

const SAMPLE = path.join(__dirname, "..", "sample-vault");
const NOW = new Date("2026-05-31T00:00:00Z");

describe("buildVaultData against the sample vault", () => {
  let vault: VaultData;

  beforeAll(async () => {
    vault = await buildVaultData(SAMPLE, { now: NOW });
  });

  it("reads the config and maps every declared entityType", () => {
    expect(vault.config.projectName).toMatch(/Work Brain/);
    expect(vault.unmatchedEntityTypes).toEqual([]);
  });

  it("ignores CLAUDE.md and classifies pages into the 7 roles", () => {
    const paths = vault.pages.map((p) => p.relPath);
    expect(paths).not.toContain("CLAUDE.md");
    expect(vault.byRole.project.length).toBeGreaterThanOrEqual(4);
    expect(vault.byRole.person.length).toBeGreaterThanOrEqual(3);
    expect(vault.byRole.org.length).toBeGreaterThanOrEqual(2);
    expect(vault.byRole.commitment.length).toBeGreaterThanOrEqual(3);
    expect(vault.byRole.activity.length).toBeGreaterThanOrEqual(3);
    expect(vault.byRole.theme.length).toBeGreaterThanOrEqual(2);
    expect(vault.byRole.research.length).toBeGreaterThanOrEqual(2);
  });

  it("classifies the no-frontmatter project from its folder", () => {
    const legacy = vault.bySlug["legacy-cleanup"];
    expect(legacy?.role).toBe("project");
    expect(legacy?.status).toBeUndefined();
  });

  it("populates backlinks (Acme Corp is referenced by other pages)", () => {
    const acme = vault.bySlug["acme-corp"];
    expect(acme).toBeTruthy();
    expect(acme!.backlinks.length).toBeGreaterThan(0);
  });

  it("resolves markdown-style links (Globex page) to real pages", () => {
    const globex = vault.bySlug["globex"];
    expect(globex).toBeTruthy();
    const resolved = globex!.outLinks.filter((l) => l.resolvedId);
    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.map((l) => l.slug)).toContain("sam-lee");
  });

  it("derives one overdue commitment and one stale contact", () => {
    const overdue = vault.byRole.commitment.filter((c) => (c as { isOverdue?: boolean }).isOverdue);
    expect(overdue.map((c) => c.slug)).toContain("review-migration-plan");

    const stale = vault.byRole.person.filter((p) => (p as { stale?: boolean }).stale);
    expect(stale.map((p) => p.slug)).toContain("sam-lee");
  });

  it("builds a timeline sorted descending by date", () => {
    const dates = vault.timeline.map((e) => e.date);
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : -1));
    expect(dates).toEqual(sorted);
    expect(vault.timeline.length).toBeGreaterThan(0);
  });
});
