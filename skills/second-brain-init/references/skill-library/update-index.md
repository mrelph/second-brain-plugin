---
name: update-index
description: >
  Use when the user asks to "update the index", "rebuild the maps of content",
  "refresh the indexes", or "make an index for [area]". Maintains one Map-of-Content
  index page per activity area and wiki category, linking the pages within. Do NOT
  use to fix broken links (use vault-doctor) or to answer questions (use recall).
version: 1.0.0
---

# update-index

Builds and refreshes one Map-of-Content (`_index.md`) page per activity area and per wiki category in the {{projectName}} vault, keeping every section of the vault navigable.

## Before you start

Read `.second-brain.json` at the vault root before doing anything else. You need:

- `categories.activityAreas` — the exact folder names of the activity areas in this vault (e.g., `["01 - Steering", "02 - Research", ...]`).
- `categories.wikiCategories` — the subfolders of `wiki/` to index (e.g., `["entities", "concepts", "topics"]`).
- `wiki.linkStyle` — `"wikilinks"` or `"markdown"`: determines which link format to use in the generated index.
- `wiki.pageNaming` — `"title-case"`, `"kebab-case"`, or `"sentence-case"`: affects how display names are derived from filenames.

Do not assume default folder names — always read the live config.

## What it builds

For each folder in `categories.activityAreas`, create or update `<area>/_index.md`.
For each folder in `categories.wikiCategories`, create or update `wiki/<category>/_index.md`.

Each index page:

- Lists and links every `.md` file in that folder (non-recursive — direct children only), excluding `_index.md` itself, `_example-*` files, and `.gitkeep`.
- Uses the configured link style: wikilinks (`[[Page]]`) if `wiki.linkStyle` is `"wikilinks"`; markdown links (`[Page](page.md)`) if `"markdown"`.
- Groups entries sensibly when there are more than ten pages (e.g., alphabetical groups or by inferred sub-theme). For fewer than ten, a flat list is fine.
- Derives display names from filenames using `wiki.pageNaming` (e.g., `my-note.md` → "My Note" for title-case).

## Rules

**Idempotent**: re-running this skill on a vault that already has `_index.md` files updates them in place — it does not create duplicates or append redundant entries. Always overwrite the auto-generated section, never the human-written section.

**Preserve human-written prose**: each `_index.md` may contain a human-written introduction or notes above a `<!-- index:auto -->` marker. Only the content *below* this marker is regenerated. If no marker exists yet, insert it just before the auto-generated list and leave everything above it untouched.

**No content invention**: index pages contain only links and brief descriptive headings derived from filenames — never synthesized summaries of page content.

**Report what changed**: after running, show a brief summary: how many index files were created, how many updated, and how many entries each contains.

## What this skill does NOT do

- Does not create content pages — only `_index.md` index files.
- Does not delete any existing page, including stale entries; it replaces the auto-generated section in full on each run.
- Does not recurse into subdirectories of activity areas or wiki categories beyond the immediate children listed above.
