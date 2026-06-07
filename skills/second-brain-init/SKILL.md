---
name: second-brain-init
description: >
  Use this skill when the user asks to "set up a second-brain", "create a knowledge base",
  "build a personal wiki", "initialize second-brain", "organize my notes into a wiki", or
  "start a second brain". Also activate for "I want a second brain for my [research / journal / notes]"
  and "help me start organizing my notes into a structured KB".

  Do NOT activate for: "set up Obsidian", "create a new note", "make a wiki page", queries
  about an existing vault that just needs opening ("show me my notes", "what's in my second-brain",
  "open my knowledge base"), or any request that is purely about maintaining or querying an
  already-initialized vault. Do NOT activate for "register my vault", "add vault to registry",
  or "remember this vault" — there is no register mode. Do NOT mention or invoke any external CLI.
version: 1.0.0
---

# second-brain-init

Design and generate a structured knowledge-base vault from scratch, using the Write tool. This skill is fully self-contained — it conducts a conversational interview (or infers a config from existing notes), assembles a `.second-brain.json`, and writes the complete folder structure, contract files, templates, and seed pages directly. There is no external CLI dependency.

## When to act

Activate on phrases like:

- "Set up a second-brain"
- "Create a knowledge base for [topic]"
- "Build me a personal wiki"
- "Initialize second-brain in [folder]"
- "I want a second brain for my [research / journal / notes]"
- "Help me start organizing my notes"
- "Organize my notes into a wiki"

Do **not** activate when the user is asking about an *existing* vault. For content queries ("what do we know about X?"), read the relevant `wiki/` files — the assistant contract in `AGENTS.md` / `CLAUDE.md` covers that flow.

## What this skill does NOT do

Be deliberate about scope. This skill handles **initial setup only**. After the vault is generated, the embedded assistant contract (in `AGENTS.md` / `CLAUDE.md`) takes over all ongoing maintenance. Specifically, this skill does not:

- Maintain the wiki — that is the assistant's ongoing job, governed by the generated contract.
- Re-initialize an existing vault — if `.second-brain.json` already exists at the target, there is no re-init mode.
- Pre-populate `wiki/` with content. Setup scaffolds a single example seed page; real content comes from the user's sources after setup.
- Register the vault in any external registry — there is no registry or CLI.

If the user asks to "set up AND ingest these files in one step", complete setup first, then suggest "now ingest my inbox" as a follow-up — the assistant handles that via the contract, not via this skill.

---

## Workflow

Follow this sequence end-to-end.

### 1. Pre-flight: resolve the target location

Default `<target>` to the current working directory if the user did not specify one.

**Check for an existing vault:**

```bash
test -f <target>/.second-brain.json && echo exists
```

If that prints `exists`, **STOP**. Tell the user this folder is already an initialized vault and there is no re-init mode. Suggest they open the folder in their assistant and work from the existing `AGENTS.md` contract.

**Check for a non-empty directory (interview mode only):**

If the target is non-empty (contains files other than a lone `.git` directory), do not silently proceed in interview mode. Ask the user:

- Should we use a different (new) directory?
- Should we proceed anyway and scaffold around existing content (treating this as ingest mode)?
- Is this folder actually an existing vault that just lacks a `.second-brain.json`?

### 2. Choose mode: interview or ingest

Branch based on what is on disk at the target path:

- **Ingest mode**: the target folder contains existing notes/material but has NO `.second-brain.json`. Read 5-15 representative files (filenames, headings, tags), infer config fields from observed patterns, then **show the inferred config and ask the user to confirm or adjust**. Heuristics in `references/ingest-heuristics.md`. When in ingest mode, NEVER overwrite existing files — scaffold only what is missing.
- **Interview mode** (default): the user is starting fresh with an empty or non-existent target. Conduct the adaptive walkthrough from `references/interview-script.md`.

When in doubt, default to interview mode.

### 3. Run the adaptive walkthrough (or fast path)

Reference `references/interview-script.md` for the full question flow, field mappings, and example responses.

The interview is **adaptive**: use structured AskUserQuestion cards for real trade-offs (activity area names, link style, source-handling mode), and use free-form conversation for open-ended fields (domain description, entity types, sample queries). Cover:

1. **Project name** — what should we call this knowledge base?
2. **Domain** — a one-line description of what the KB covers.
3. **Entity types** — recurring kinds of pages (e.g., `["papers", "authors", "methods"]`). Offer concrete defaults based on the stated domain; the user can adjust.
4. **Activity areas** — the six numbered folders (`01 - Steering` through `06 - People`). Show the canonical defaults from `references/vault-structure.md` and ask if any need renaming.
5. **Link style** — `"wikilinks"` (Obsidian-friendly `[[Page]]`) or `"markdown"` (portable `[Page](page.md)`). Default to `"wikilinks"`.
6. **Source handling** — `"archive-after-ingest"` (move processed files to `sources/archive/`) or `"leave-in-inbox"` (leave them in place). Default to `"archive-after-ingest"`.

Skip fields the user volunteers unprompted. Don't ask about fields with sensible defaults unless the user raises them (`wiki.frontmatter`, `wiki.pageNaming`, `schema.styleGuide`).

**Fast path:** if the user provides all key details up front (name, domain, entity types, link style), skip the structured interview and move directly to config construction.

### 4. Construct the config

Build a `.second-brain.json` matching the schema defined in `references/vault-structure.md`. Use `references/example-configs.md` for reference shapes for common domains (research, journal, recipes, engineering notes).

Required fields:

- `projectName` — human-readable name; appears in headings.
- `defaultAgent` — default to `"claude-code"` unless the user names a different assistant.
- `formatVersion` — always `"1"`.
- `schema.domain` — the one-line domain description.
- `schema.entityTypes` — array of recurring page kinds.
- `schema.commonQueries` — array of sample questions the wiki should answer well.
- `categories.activityAreas` — array of `{ "number": N, "name": "..." }` objects for the six activity folders.
- `categories.wikiCategories` — default to `["entities", "concepts", "topics"]`.
- `wiki.linkStyle` — `"wikilinks"` or `"markdown"`.
- `sourceHandling.mode` — `"archive-after-ingest"` or `"leave-in-inbox"`.

### 5. Confirm gate

Before writing any files, present to the user:

1. The full `.second-brain.json` as a formatted code block.
2. The complete folder tree that will be created.
3. The list of every file that will be written.

State clearly: **"This is the last reversible point. Shall I proceed and create the vault?"**

Do not write any files until the user explicitly confirms. If they request changes, revise the config and re-present the confirm gate.

### 6. Generate the vault

Write all files using the **Write tool** (not Bash heredocs — JSON and markdown content may contain special characters that break shell quoting). The Write tool auto-creates parent directories and handles spaces in folder names like `01 - Steering/` cleanly.

Write files in this exact order:

1. **`.second-brain.json`** — the config, as confirmed.
2. **`README.md`** — project overview using the `projectName` and `schema.domain`. Include a brief folder-layout summary.
3. **`AGENTS.md`** — the three-block assistant contract. Use `references/contract-template.md` for the exact structure: managed block (vault identity and conventions), Project Customizations block (user-editable), Assistant Observations block (assistant's working memory). Populate the managed block from the confirmed config.
4. **`CLAUDE.md`** — a single-line file that imports `AGENTS.md` with `@AGENTS.md`. Use `references/contract-template.md` for the exact format.
5. **Templates (9 files in `templates/`)** — write each template from `references/page-templates.md`. Use the canonical filenames defined there.
6. **Seed pages** — write `_example-*.md` files in the appropriate `wiki/` subdirectories, one per major entity type. Use `references/page-templates.md` for seed-page guidance.
7. **`.gitkeep` files** — write a `.gitkeep` into every folder that would otherwise be empty after the above writes (e.g., `sources/inbox/`, `sources/archive/`, any wiki subcategory with no seed page, any activity area folder).

**Ingest mode note:** never overwrite an existing file. If a file already exists at a target path, skip it and note which files were skipped in the hand-off summary.

After writing files, offer to run `git init` in the target directory (default: yes). If the user agrees, run it via Bash.

### 7. Hand off

Summarize what was created in 3-5 lines (number of files written, folder layout, config highlights).

Then give the user three concrete next actions:

1. Drop your notes, PDFs, and links into `sources/inbox/`.
2. Open the vault folder in your AI assistant (so it picks up `CLAUDE.md` → `AGENTS.md`).
3. Ask the assistant: "ingest my inbox" or "what do we know about [X]?" — the assistant contract now governs all ongoing maintenance.

Remind the user that `AGENTS.md` / `CLAUDE.md` defines how the assistant maintains the vault going forward, and that they can freely edit the **Project Customizations** block in `AGENTS.md` to add personal preferences, domain rules, or style notes. Both the Project Customizations block and the Assistant Observations block are user-and-assistant-owned and are never overwritten.

---

## Additional resources

### Reference files

- **`references/vault-structure.md`** — canonical folder layout and complete `.second-brain.json` schema (all fields, types, defaults, and enum values).
- **`references/contract-template.md`** — the three-block `AGENTS.md` template and the `CLAUDE.md` `@AGENTS.md` import line.
- **`references/page-templates.md`** — the nine page templates and seed-page guidance for initial wiki population.
- **`references/interview-script.md`** — the adaptive interview walkthrough for fresh setup: question flow, field mappings, and example user responses.
- **`references/ingest-heuristics.md`** — how to infer a config from an existing folder of notes: what to read, what signals matter, how to handle ambiguous structure.
- **`references/example-configs.md`** — sample `.second-brain.json` configs in the current schema shape for common domains (research, journal, recipes, engineering notes).
