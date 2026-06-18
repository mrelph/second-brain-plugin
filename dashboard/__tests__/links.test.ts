import { describe, expect, it } from "vitest";
import { slugify, extractBodyLinks, toLinkRefs } from "@/lib/vault/links";

describe("slugify", () => {
  it("collapses wikilink, filename, and titled forms to one slug", () => {
    expect(slugify("Acme Corp")).toBe("acme-corp");
    expect(slugify("acme-corp.md")).toBe("acme-corp");
    expect(slugify("../orgs/Acme Corp.md")).toBe("acme-corp");
    expect(slugify("Acme  Corp")).toBe("acme-corp");
  });
});

describe("extractBodyLinks", () => {
  it("parses both wikilinks and local markdown links, ignoring external urls", () => {
    const body = `See [[Acme Corp]] and [Sam Lee](../people/Sam Lee.md).
      Also [Globex](https://globex.example) should be ignored as external.`;
    const slugs = extractBodyLinks(body).map((l) => l.slug);
    expect(slugs).toContain("acme-corp");
    expect(slugs).toContain("sam-lee");
    expect(slugs).not.toContain("globex");
  });

  it("dedupes repeated targets and handles wikilink aliases", () => {
    const body = "[[Acme Corp]] and [[Acme Corp|the client]] again";
    const links = extractBodyLinks(body);
    expect(links).toHaveLength(1);
    expect(links[0].slug).toBe("acme-corp");
  });
});

describe("toLinkRefs", () => {
  it("handles strings, wikilink strings, and arrays", () => {
    expect(toLinkRefs("[[Jane Doe]]")[0].slug).toBe("jane-doe");
    expect(toLinkRefs(["[[A]]", "[[B]]"]).map((r) => r.slug)).toEqual(["a", "b"]);
    expect(toLinkRefs(null)).toEqual([]);
  });
});
