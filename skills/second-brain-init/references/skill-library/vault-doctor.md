---
name: vault-doctor
description: >
  Use when the user asks to "check the vault", "find broken links", "run vault
  doctor", "health-check my notes", or "what's broken in my second-brain". Scans
  the vault for broken/orphaned links, inconsistent frontmatter, and unlinked or
  empty pages, then offers to fix. Do NOT use for creating content or answering
  knowledge questions (use recall for that).
version: 1.0.0
---

# vault-doctor

Runs a structural health check on the {{projectName}} vault and reports (and optionally repairs) broken links, orphaned pages, frontmatter drift, and empty stubs.

## Before you start

Read `.second-brain.json` at the vault root before doing anything else. You need:

- `categories.activityAreas` — the numbered activity-area folder names in use for this vault.
- `categories.wikiCategories` — the subfolder names under `wiki/`.
- `wiki.linkStyle` — `"wikilinks"` or `"markdown"`: determines what link syntax to scan for.
- `wiki.frontmatter` — whether pages are expected to carry YAML frontmatter.

Do not assume the default activity-area names or wiki categories — always read the live config.

## Checks

Run all four checks in sequence and collect results before presenting the report.

### 1. Broken links

Scan every `.md` file in the vault. For each link found:

- If `wiki.linkStyle` is `"wikilinks"`, scan for `[[Page]]` and `[[Page|Alias]]` patterns.
- If `wiki.linkStyle` is `"markdown"`, scan for `[text](path.md)` patterns (relative paths only — ignore external URLs).

A link is **broken** if the target page does not exist on disk (case-insensitive match). Record: source file path, line number, link text, missing target.

### 2. Orphaned pages

A page is **orphaned** if no other `.md` file in the vault links to it AND it is not an `_index.md`, `_example-*`, or `.gitkeep`. Orphaned pages are candidates for deletion or integration.

### 3. Inconsistent frontmatter

Only run this check when `wiki.frontmatter` is `true`. Compare each page's YAML frontmatter against the matching template in `templates/`. A page is flagged if it is missing a required field that the template defines. Record the field names that are absent.

### 4. Empty stubs

A page is an **empty stub** if it contains only frontmatter or only a top-level heading with no body content beneath it. These are typically pages created as link targets but never filled in.

Note: link syntax used in checks 1 and 2 depends on `wiki.linkStyle` as described above.

## Report

Group results by check. For each issue, include:

- The relative file path and line number (e.g., `wiki/concepts/attention.md:14`).
- A short description of the issue.

End each section with a count: "3 broken links found", "0 orphaned pages", etc.

If no issues are found in a check, say so explicitly — do not omit the section.

## Fixing

After presenting the report, ask the user which issues to fix. Never bulk-edit without first showing the exact planned changes.

- **Broken links — missing target stubs**: offer to create a minimal stub page at the missing path (frontmatter + heading only). Only create stubs with explicit approval.
- **Orphaned pages**: do not delete without explicit confirmation. List them and ask whether to link them from an index, delete them, or leave them.
- **Frontmatter drift**: offer to add the missing fields using the template defaults. Show the diff before applying.
- **Empty stubs**: no automated fix — flag them for the user to fill in manually.

If the user approves a batch of fixes, apply them one file at a time and confirm each write.

## What this skill does NOT do

- Does not create knowledge content or answer questions about what is in the vault (use recall for that).
- Does not delete any page without the user's explicit confirmation on that specific page.
- Does not modify files outside the vault root where `.second-brain.json` lives.
