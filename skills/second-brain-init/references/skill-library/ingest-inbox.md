---
name: ingest-inbox
description: >
  Use when the user asks to "ingest my inbox", "process new notes", "file my
  inbox", or "what's in my inbox". Reads raw material in sources/inbox/, files it
  into the right activity area from the matching template, distills durable
  knowledge into linked wiki/ pages, then archives or leaves the source per config.
  Do NOT use to answer questions about existing content (use recall).
version: 1.0.0
---

# ingest-inbox

Processes everything in `sources/inbox/` for the {{projectName}} vault — a {{domain}} knowledge base — by filing each item into the right activity area and distilling durable knowledge into linked wiki pages.

## Before you start

Read `.second-brain.json` at the vault root before doing anything else. You need:

- `categories.activityAreas` — the exact folder names and numbering for this vault.
- `categories.wikiCategories` — the subfolders of `wiki/` where distilled knowledge lives.
- `wiki.linkStyle` — `"wikilinks"` or `"markdown"`: determines link syntax used in all created/updated pages.
- `wiki.frontmatter` — whether new pages should include YAML frontmatter.
- `sourceHandling.mode` — `"archive-after-ingest"` or `"leave-in-inbox"`: governs what happens to source files after processing.

Also inspect the `templates/` folder to understand the available page templates and their required frontmatter fields.

## The loop

Work through every file in `sources/inbox/` one at a time. For each item:

**1. Read the source.**
Open and read the full content of the file. Note its filename, any dates or metadata, and overall subject matter.

**2. Classify.**
Determine the best-fit activity area from `categories.activityAreas` (e.g., a meeting note goes into the meeting-notes area; a research paper goes into the research area). Note whether the content also contains durable facts, concepts, or named entities that belong in `wiki/`.

**3. File into the activity area.**
Create a new page in the matched activity area using the corresponding template from `templates/`. If a closely related page already exists there, append a new dated section rather than overwriting it. When `wiki.frontmatter` is `true`, fill in all frontmatter fields from the template.

**4. Distill into wiki pages.**
Extract durable, reusable knowledge from the source — key facts, concepts, named entities, and definitions. For each item worth preserving:
- Find or create the appropriate page in `wiki/<category>/`.
- Write the distilled content concisely.
- Link liberally: use wikilinks `[[Page]]` or markdown `[Page](page.md)` per `wiki.linkStyle` to connect related pages.
- Link back from the filed activity-area page to the wiki pages created or updated.

**5. Apply source handling.**
After the derived pages have been successfully written:
- `archive-after-ingest` → move the source file from `sources/inbox/` to `sources/archive/`. Only move after confirming the write succeeded.
- `leave-in-inbox` → leave the source file in place.

## Rules

- **Never lose source content.** Only move a source file to archive after all derived pages have been written successfully.
- **Never overwrite an existing page.** If a page at the target path already exists and the new material is additive, append a new dated section. If the content is substantially different, create a new linked page instead.
- **Show a summary when done.** After processing all inbox items, present a table or list: source filename → activity-area page created/updated → wiki pages created/updated → source disposition (archived or left).

## What this skill does NOT do

- Does not delete source files — it only moves them to `sources/archive/` when `sourceHandling.mode` is `"archive-after-ingest"`.
- Does not answer recall queries about existing content (use recall for that).
- Does not modify files outside the vault root where `.second-brain.json` lives.
