# Workflow Interview + Generated Vault Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the self-contained `second-brain-init` skill (v1.1.0) to map the user's workflow via a two-thread interview and generate executable Claude Code skills into `<vault>/.claude/skills/` — a fixed baseline library plus workflow-tailored additions.

**Architecture:** Mirror the v1.0.0 architecture — a lean `SKILL.md` orchestrator plus progressive-disclosure `references/`. Baseline skills ship as a parameterized template library in `references/skill-library/`; tailored skills are model-authored to a fixed shape documented in `references/skill-generation.md`. Generated skills read `.second-brain.json` at runtime for live structure; only wording/description is baked at generation.

**Tech Stack:** Markdown skill files (no executable code, no test harness). Verification is via `grep` / YAML-parse checks; the plan ends with a real generate-a-vault dry-run.

**Source spec:** `docs/superpowers/specs/2026-06-07-vault-workflow-skills-design.md`

---

## File Structure

All paths under repo root `/mnt/c/Coding/second-brain-plugin`.

- **Update:** `skills/second-brain-init/references/vault-structure.md` — add `.claude/skills/` to the layout tree; add `skills` + `usageProfile` to the `.second-brain.json` schema.
- **Update:** `skills/second-brain-init/references/contract-template.md` — add an "Available skills" section to the MANAGED block + its placeholder substitution.
- **New:** `skills/second-brain-init/references/skill-library/vault-doctor.md`
- **New:** `skills/second-brain-init/references/skill-library/update-index.md`
- **New:** `skills/second-brain-init/references/skill-library/ingest-inbox.md`
- **New:** `skills/second-brain-init/references/skill-library/weekly-review.md`
- **New:** `skills/second-brain-init/references/skill-library/recall.md`
- **New:** `skills/second-brain-init/references/skill-generation.md` — parameterization + tailored-skill pattern + guardrails.
- **New:** `skills/second-brain-init/references/workflow-interview.md` — the usage thread.
- **Update:** `skills/second-brain-init/references/interview-script.md` — structure-thread enhancements + hand-off to workflow-interview.md.
- **Update:** `skills/second-brain-init/SKILL.md` — usage thread; skill generation in confirm + generate steps; hand-off; version bump.
- **Update:** `README.md` — document the generated-skills capability.
- **Update:** `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` — version 1.1.0; descriptions mention stood-up skills.

**Build order rationale (phased per spec):** schema + contract first (everything references the schema) → the five baseline templates → the generation/interview references → SKILL.md wiring + manifests + README → consistency sweep + dry-run. Within `skill-library/`, the five templates are independent of each other.

**Shared conventions for all generated skill templates (Tasks 3–7):**
- Each file is a complete `SKILL.md` body: YAML frontmatter (`name`, `description`, `version: 1.0.0`) then the markdown body.
- Frontmatter `name` is the skill's kebab-case name. `description` lists trigger phrases AND at least one negative/anti-trigger.
- Bodies instruct the skill to **read `<vault-root>/.second-brain.json` at runtime** for live structure (activity areas, `wiki.linkStyle`, `sourceHandling.mode`, etc.) rather than hardcoding them.
- The ONLY baked `{{placeholders}}` permitted in these templates are `{{projectName}}` and `{{domain}}` (used for wording in the description/body). Everything structural is read at runtime. This keeps the dry-run's "no unresolved placeholder except {{projectName}}/{{domain}} which the generator substitutes" assertion meaningful.
- Respect `wiki.linkStyle`: bodies must say "use wikilinks `[[Page]]` or markdown `[Page](page.md)` per `wiki.linkStyle` in `.second-brain.json`".

---

## Task 1: Update `vault-structure.md` — `.claude/skills/` + schema additions

**Files:**
- Modify: `skills/second-brain-init/references/vault-structure.md`

- [ ] **Step 1: Add `.claude/skills/` to the folder tree**

Read the file. In the folder-layout fenced code block, add these lines (place the `.claude/` entry near the top, after `CLAUDE.md`):

```
├── .claude/
│   └── skills/                # generated Claude Code skills (maintenance + usage + tailored)
│       ├── vault-doctor/
│       ├── update-index/
│       ├── ingest-inbox/
│       ├── weekly-review/
│       └── recall/            # (+ any workflow-tailored skills)
```

Add a layout rule bullet: "The `.claude/skills/` folder holds executable Claude Code skills generated at setup. Claude Code auto-discovers them when the vault folder is opened. Vault content stays Obsidian-compatible; the skills run in Claude Code, not inside Obsidian."

- [ ] **Step 2: Add `skills` and `usageProfile` to the schema example**

In the `.second-brain.json` schema fenced block, add these two top-level fields (after `sourceHandling`):

```json
  "skills": [
    { "name": "ingest-inbox", "kind": "baseline", "description": "Process sources/inbox into filed + distilled notes" }
  ],
  "usageProfile": {
    "regularActivities": ["short phrases: what the user does regularly"],
    "aiResponsibilities": ["what the user wants the AI to do"],
    "tailoredSkills": ["names of workflow-specific skills generated"]
  }
```

- [ ] **Step 3: Add field notes**

Under "### Field notes", add:
- "`skills`: a record of the Claude Code skills generated into `.claude/skills/`. `kind` is `baseline` (always generated) or `tailored` (derived from the usage interview)."
- "`usageProfile`: captured from the usage thread of the interview. Lets the assistant understand intended use and a future regenerator rebuild skills. Optional — omitted on the fast path."

- [ ] **Step 4: Verify**

Run from repo root:
- `grep -E "\.claude/skills/|usageProfile|\"skills\"" skills/second-brain-init/references/vault-structure.md` → all three present.
- `grep -c "vault-doctor" skills/second-brain-init/references/vault-structure.md` → `>= 1`.

- [ ] **Step 5: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/vault-structure.md
git commit -m "feat: add .claude/skills/ layout + skills/usageProfile schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Update `contract-template.md` — "Available skills" block

**Files:**
- Modify: `skills/second-brain-init/references/contract-template.md`

- [ ] **Step 1: Add the "Available skills" section to the MANAGED block**

Read the file. In the `AGENTS.md` skeleton, inside the MANAGED block, add this section immediately before `## Style guide`:

```markdown
## Available skills
This vault ships with Claude Code skills in `.claude/skills/`. Use them when relevant:
{{skillsList}}
```

- [ ] **Step 2: Document the `{{skillsList}}` placeholder substitution**

In the "## Placeholder substitution" table, add a row:

```
| `{{skillsList}}` | `skills` | A markdown bullet per generated skill: `- **<name>** — <description>`. If `skills` is empty/absent, write `- (none generated — run setup again to add skills)`. |
```

- [ ] **Step 3: Verify**

Run:
- `grep -F "Available skills" skills/second-brain-init/references/contract-template.md` → found.
- `grep -F "{{skillsList}}" skills/second-brain-init/references/contract-template.md` → found (appears in skeleton AND in the table = 2 matches).
- `grep -c "{{skillsList}}" skills/second-brain-init/references/contract-template.md` → `2`.

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/contract-template.md
git commit -m "feat: add Available skills section to contract template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Baseline skill template — `vault-doctor.md`

**Files:**
- Create: `skills/second-brain-init/references/skill-library/vault-doctor.md`

- [ ] **Step 1: Write the template**

The file is a complete `SKILL.md`. Use this frontmatter verbatim:

```markdown
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
```

Body MUST contain these sections:
- `# vault-doctor` + one-line purpose mentioning `{{projectName}}`.
- `## Before you start` — read `.second-brain.json` at the vault root to learn the activity areas (`categories.activityAreas`), wiki categories (`categories.wikiCategories`), `wiki.linkStyle`, and `wiki.frontmatter`. State that all structural facts come from there, not from this file.
- `## Checks` — a checklist the skill performs: (1) broken links — every `[[Page]]` / `[Page](page.md)` target resolves to an existing file; (2) orphaned pages — pages not linked from any index or other page; (3) frontmatter — every page's frontmatter matches the relevant `templates/` shape (right `type:`, required fields present) when `wiki.frontmatter` is true; (4) empty stubs — pages with only a heading/frontmatter and no body. Note that link syntax to check depends on `wiki.linkStyle`.
- `## Report` — present findings grouped by check, with `path:line` references; counts per category.
- `## Fixing` — offer to fix; NEVER bulk-edit without showing the user the planned changes first; fix conservatively (create missing target stubs only if the user approves; normalize frontmatter to match templates).
- `## What this skill does NOT do` — does not create knowledge content, does not delete pages without explicit confirmation.

Keep it concise and instructional. Only `{{projectName}}` may appear as a baked placeholder.

- [ ] **Step 2: Verify**

Run:
- `head -1 skills/second-brain-init/references/skill-library/vault-doctor.md` → `---` (frontmatter starts at line 1).
- `grep -E "^name: vault-doctor$" skills/second-brain-init/references/skill-library/vault-doctor.md` → found.
- `grep -F ".second-brain.json" skills/second-brain-init/references/skill-library/vault-doctor.md` → found (reads config at runtime).
- `grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/vault-doctor.md | sort -u` → only `{{projectName}}` (no other placeholders).

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-library/vault-doctor.md
git commit -m "feat: add vault-doctor baseline skill template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Baseline skill template — `update-index.md`

**Files:**
- Create: `skills/second-brain-init/references/skill-library/update-index.md`

- [ ] **Step 1: Write the template**

Frontmatter verbatim:

```markdown
---
name: update-index
description: >
  Use when the user asks to "update the index", "rebuild the maps of content",
  "refresh the indexes", or "make an index for [area]". Maintains one Map-of-Content
  index page per activity area and wiki category, linking the pages within. Do NOT
  use to fix broken links (use vault-doctor) or to answer questions (use recall).
version: 1.0.0
---
```

Body MUST contain:
- `# update-index` + one-line purpose mentioning `{{projectName}}`.
- `## Before you start` — read `.second-brain.json` for `categories.activityAreas`, `categories.wikiCategories`, `wiki.linkStyle`, `wiki.pageNaming`.
- `## What it builds` — for each activity area and each wiki category, create/update an index page (e.g. `<area>/_index.md` or `wiki/<category>/_index.md`) that lists and links every page in that folder, grouped sensibly (by sub-topic or alphabetically), using the configured link style. Skip `_example-*` and `.gitkeep` files.
- `## Rules` — idempotent (re-running updates in place, doesn't duplicate); preserve any human-written prose at the top of an existing index between the heading and a `<!-- index:auto -->` marker; only the auto section below the marker is regenerated.
- `## What this skill does NOT do` — does not create content pages, does not delete pages.

Only `{{projectName}}` baked.

- [ ] **Step 2: Verify**

Run:
- `grep -E "^name: update-index$" skills/second-brain-init/references/skill-library/update-index.md` → found.
- `grep -F ".second-brain.json" skills/second-brain-init/references/skill-library/update-index.md` → found.
- `grep -F "index:auto" skills/second-brain-init/references/skill-library/update-index.md` → found (idempotency marker).
- `grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/update-index.md | sort -u` → only `{{projectName}}`.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-library/update-index.md
git commit -m "feat: add update-index baseline skill template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Baseline skill template — `ingest-inbox.md`

**Files:**
- Create: `skills/second-brain-init/references/skill-library/ingest-inbox.md`

- [ ] **Step 1: Write the template**

Frontmatter verbatim:

```markdown
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
```

Body MUST contain:
- `# ingest-inbox` + one-line purpose mentioning `{{projectName}}` and `{{domain}}`.
- `## Before you start` — read `.second-brain.json` for `categories.activityAreas`, `categories.wikiCategories`, `wiki.linkStyle`, `wiki.frontmatter`, `sourceHandling.mode`, and the `templates/` folder.
- `## The loop` — for each item in `sources/inbox/`: (1) read it; (2) classify into the best activity area (and note whether it's also a permanent wiki concept); (3) create or append the area page using the matching file in `templates/`, filling frontmatter if enabled; (4) distill durable facts into linked `wiki/` pages (entities/concepts/topics) using the configured link style, linking liberally; (5) apply `sourceHandling.mode` — if `archive-after-ingest`, move the source to `sources/archive/`; if `leave-in-inbox`, leave it.
- `## Rules` — never lose source content (only move after the derived pages are written); never overwrite an existing page — append or create a linked new page; show the user a summary of what was filed and distilled.
- `## What this skill does NOT do` — does not delete sources, does not answer recall queries.

Baked placeholders allowed: `{{projectName}}`, `{{domain}}`.

- [ ] **Step 2: Verify**

Run:
- `grep -E "^name: ingest-inbox$" skills/second-brain-init/references/skill-library/ingest-inbox.md` → found.
- `grep -F "sourceHandling.mode" skills/second-brain-init/references/skill-library/ingest-inbox.md` → found.
- `grep -F "sources/archive/" skills/second-brain-init/references/skill-library/ingest-inbox.md` → found.
- `grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/ingest-inbox.md | sort -u` → only `{{projectName}}` and `{{domain}}`.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-library/ingest-inbox.md
git commit -m "feat: add ingest-inbox baseline skill template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Baseline skill template — `weekly-review.md`

**Files:**
- Create: `skills/second-brain-init/references/skill-library/weekly-review.md`

- [ ] **Step 1: Write the template**

Frontmatter verbatim:

```markdown
---
name: weekly-review
description: >
  Use when the user asks for a "weekly review", "what happened this week",
  "review my vault", or "what's stale / what are my open loops". Summarizes recent
  activity across activity areas, surfaces stale items and unchecked action items,
  and prompts reflection. Do NOT use to ingest new material (use ingest-inbox).
version: 1.0.0
---
```

Body MUST contain:
- `# weekly-review` + one-line purpose mentioning `{{projectName}}`.
- `## Before you start` — read `.second-brain.json` for `categories.activityAreas` and `wiki.frontmatter` (to know whether pages carry `created`/`date` frontmatter for windowing).
- `## What it produces` — (1) Recent activity: pages created/modified in the review window (default last 7 days; ask the user if they want a different window) grouped by area; (2) Open loops: unchecked `- [ ]` action items found in `03 - Meeting Notes/` and `04 - Projects/` (or their renamed equivalents from config); (3) Stale items: pages not touched in a long time that look unfinished; (4) Reflection prompts.
- `## Output` — offer to write the review as a dated note into the steering area (the first activity area, typically `01 - Steering/`) or just present it in chat; ask which.
- `## What this skill does NOT do` — does not modify content pages, does not ingest sources.

Only `{{projectName}}` baked.

- [ ] **Step 2: Verify**

Run:
- `grep -E "^name: weekly-review$" skills/second-brain-init/references/skill-library/weekly-review.md` → found.
- `grep -F ".second-brain.json" skills/second-brain-init/references/skill-library/weekly-review.md` → found.
- `grep -F "- [ ]" skills/second-brain-init/references/skill-library/weekly-review.md` → found (open-loops check).
- `grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/weekly-review.md | sort -u` → only `{{projectName}}`.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-library/weekly-review.md
git commit -m "feat: add weekly-review baseline skill template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Baseline skill template — `recall.md`

**Files:**
- Create: `skills/second-brain-init/references/skill-library/recall.md`

- [ ] **Step 1: Write the template**

Frontmatter verbatim:

```markdown
---
name: recall
description: >
  Use when the user asks "what do we know about [X]?", "recall [topic]", "what
  have I written about [X]", or "summarize what's in the vault about [X]". Searches
  wiki/ and the activity areas, follows links, and synthesizes a cited answer with
  page references. Do NOT use to add or file content (use ingest-inbox).
version: 1.0.0
---
```

Body MUST contain:
- `# recall` + one-line purpose mentioning `{{projectName}}` and `{{domain}}`.
- `## Before you start` — read `.second-brain.json` for `categories.wikiCategories`, `categories.activityAreas`, and `wiki.linkStyle`.
- `## How to answer` — (1) search `wiki/` first (the distilled knowledge), then the activity areas; (2) follow links between pages to gather related context; (3) synthesize a concise answer; (4) cite every claim with the source `path` it came from; (5) clearly separate what the vault says from your own synthesis.
- `## When the vault is thin` — if little is found, say so plainly and suggest the user run `ingest-inbox` or add notes; do not fabricate.
- `## What this skill does NOT do` — does not modify the vault, does not invent facts not in the pages.

Baked placeholders allowed: `{{projectName}}`, `{{domain}}`.

- [ ] **Step 2: Verify**

Run:
- `grep -E "^name: recall$" skills/second-brain-init/references/skill-library/recall.md` → found.
- `grep -F ".second-brain.json" skills/second-brain-init/references/skill-library/recall.md` → found.
- `grep -iF "cite" skills/second-brain-init/references/skill-library/recall.md` → found.
- `grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/recall.md | sort -u` → only `{{projectName}}` and `{{domain}}`.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-library/recall.md
git commit -m "feat: add recall baseline skill template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: `skill-generation.md` — parameterization + tailored-skill pattern

**Files:**
- Create: `skills/second-brain-init/references/skill-generation.md`

- [ ] **Step 1: Write the file**

It MUST contain:

**Intro** — this reference governs how the setup writes skills into `<vault>/.claude/skills/`.

**Section "Generating the baseline skills":**
- The five baseline skills are in `references/skill-library/` (`vault-doctor`, `update-index`, `ingest-inbox`, `weekly-review`, `recall`). All three baseline bundles are always generated.
- For each, write the template to `<vault>/.claude/skills/<name>/SKILL.md`, substituting ONLY `{{projectName}}` and `{{domain}}` from `.second-brain.json`. All other structure is read by the skill at runtime — do NOT bake it.
- After writing, there must be NO unresolved `{{placeholders}}` remaining in the output files.

**Section "Generating tailored skills":**
- Tailored skills come from the usage thread (see `workflow-interview.md`). Author each to this FIXED shape (show this skeleton verbatim in a fenced block):

```markdown
---
name: <kebab-case-name>
description: >
  Use when the user asks to "<trigger phrase>" ... Do NOT use for <anti-trigger>.
version: 1.0.0
---
# <name>

## Purpose
<one line>

## When to use
<triggers and anti-triggers>

## Steps
<the procedure; reference the vault's real activity areas, templates, and link
style by reading .second-brain.json at runtime; may invoke baseline skills like
recall or ingest-inbox by name>

## Output
<where results land — which area or wiki page>
```

**Section "Guardrails":**
- Only generate a tailored skill for a RECURRING process with a DISTINCT output.
- When uncertain, do NOT generate — tell the user they can ask for it later.
- Show every candidate at the confirm gate (name + trigger + behavior + output); the user approves/edits/drops each individually.
- Cap: propose at most 3 tailored skills per setup unless the user asks for more (avoid overwhelming).

**Section "Recording":** every generated skill (baseline + tailored) is recorded in `.second-brain.json` under `skills` as `{ name, kind, description }`, and `usageProfile.tailoredSkills` lists the tailored names.

- [ ] **Step 2: Verify**

Run:
- `grep -E "skill-library|\.claude/skills/" skills/second-brain-init/references/skill-generation.md` → both present.
- `grep -F "at most 3 tailored" skills/second-brain-init/references/skill-generation.md` → found.
- `grep -E "RECURRING|recurring process" skills/second-brain-init/references/skill-generation.md` → found.
- `grep -F "{{projectName}}" skills/second-brain-init/references/skill-generation.md` → found.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/skill-generation.md
git commit -m "feat: add skill-generation reference (baseline + tailored)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: `workflow-interview.md` — the usage thread

**Files:**
- Create: `skills/second-brain-init/references/workflow-interview.md`

- [ ] **Step 1: Write the file**

It MUST contain:

**Intro** — this is the usage thread of the interview, run after the structure thread (see `interview-script.md`). It maps how the user wants to USE the vault into baseline confirmation + tailored-skill candidates.

**Section "Questions"** — a small table mapping question → purpose:
| # | Question | Drives |
|---|---|---|
| 1 | "What will you do with this vault regularly?" | usageProfile.regularActivities |
| 2 | "What do you want the AI to do for you?" | usageProfile.aiResponsibilities + which baseline skills to highlight |
| 3 | "Any recurring process you'd want a one-word command for?" | tailored-skill candidates |

Batch all three in one message. Note the fast path: if the user wants to skip, generate baseline skills only and set no `usageProfile`.

**Section "Mapping answers to skills":**
- The three baseline bundles are ALWAYS generated regardless of answers (`vault-doctor`, `update-index`, `ingest-inbox`, `weekly-review`, `recall`).
- For each recurring process the user names in Q3 (or implies in Q1/Q2) that has a distinct output, draft a tailored-skill candidate per `skill-generation.md` (fixed shape, guardrails, cap of 3).
- Map the user's wording to concrete vault structure: e.g. "prep for client calls" → a skill that reads `06 - People/` + recent meetings and drafts a brief.

**Section "Output"** — produce the `usageProfile` object and the list of tailored-skill candidates to show at the confirm gate. Do not generate anything yet.

It MUST NOT mention any external CLI.

- [ ] **Step 2: Verify**

Run:
- `grep -F "usageProfile" skills/second-brain-init/references/workflow-interview.md` → found.
- `grep -iE "fast.?path" skills/second-brain-init/references/workflow-interview.md` → found.
- `grep -F "skill-generation.md" skills/second-brain-init/references/workflow-interview.md` → found.
- `grep -iE "print-schema|second-brain init|--config|vaults add" skills/second-brain-init/references/workflow-interview.md` → NO matches.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/workflow-interview.md
git commit -m "feat: add workflow-interview reference (usage thread)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Update `interview-script.md` — structure thread + hand-off

**Files:**
- Modify: `skills/second-brain-init/references/interview-script.md`

- [ ] **Step 1: Add structure-thread enhancement + hand-off**

Read the file. Make two changes:
1. Add a short note in the structure questions that, alongside naming activity areas, the interviewer should ask WHERE content lands and whether items become permanent wiki pages — e.g. add a row or note: "When you capture a [meeting/note], where should it live, and does it become a permanent `wiki/` page?" — framing this as eliciting the inbox→area→wiki routing the maintenance/ingest skills rely on.
2. Add a hand-off line at the end (before the worked example or after it): "After the structure thread, run the **usage thread** in `references/workflow-interview.md` to map how the user will use the vault and which skills to stand up."

Do not otherwise restructure the file. It must still not mention the CLI.

- [ ] **Step 2: Verify**

Run:
- `grep -F "workflow-interview.md" skills/second-brain-init/references/interview-script.md` → found.
- `grep -iE "where should it|where content|routing|permanent.*wiki" skills/second-brain-init/references/interview-script.md` → at least one match (structure-thread enhancement present).
- `grep -iE "print-schema|second-brain init|--config|vaults add|registry" skills/second-brain-init/references/interview-script.md` → NO matches.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/interview-script.md
git commit -m "feat: structure-thread enhancement + hand-off to usage thread

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Update `SKILL.md` — usage thread + skill generation wiring

**Files:**
- Modify: `skills/second-brain-init/SKILL.md`

- [ ] **Step 1: Bump version**

Change the frontmatter `version: 1.0.0` to `version: 1.1.0`.

- [ ] **Step 2: Add the usage thread to the interview step**

In the walkthrough step that runs the interview (step 3 in the current file), add: "After the structure questions, run the **usage thread** (`references/workflow-interview.md`) to capture how the user will use the vault and surface tailored-skill candidates. On the fast path, skip the usage thread and generate baseline skills only."

- [ ] **Step 3: Extend the confirm gate**

In the confirm-gate step (step 5), add: "Also list the skills that will be created under `.claude/skills/` — the five baseline skills plus any approved tailored skills — each with its trigger phrase and output location. This gate covers the skills too."

- [ ] **Step 4: Extend the generate step**

In the generate step (step 6), after the existing file-write order, add a sub-step: "Then write the skills into `<vault>/.claude/skills/`: for each baseline skill, copy its template from `references/skill-library/<name>.md`, substituting only `{{projectName}}` and `{{domain}}`; for each approved tailored skill, author it to the fixed shape. Follow `references/skill-generation.md`. Record every generated skill in `.second-brain.json` under `skills`, and write `usageProfile`. Never overwrite an existing skill file without confirmation."

- [ ] **Step 5: Extend the hand-off step**

In the hand-off step (step 7), add: "Tell the user the vault ships with skills in `.claude/skills/` and how to invoke them (e.g. 'ingest my inbox', 'what do we know about [X]?', 'weekly review'). The contract's Available skills section lists them."

- [ ] **Step 6: Update the reference-files list**

In the "Additional resources" / reference list, add the new references: `workflow-interview.md`, `skill-generation.md`, and `skill-library/` (the baseline skill templates). Keep the existing six.

- [ ] **Step 7: Verify**

Run:
- `grep -E "version: 1.1.0" skills/second-brain-init/SKILL.md` → found.
- `grep -F "workflow-interview.md" skills/second-brain-init/SKILL.md` → found.
- `grep -F "skill-generation.md" skills/second-brain-init/SKILL.md` → found.
- `grep -F ".claude/skills/" skills/second-brain-init/SKILL.md` → found.
- `grep -F "skill-library" skills/second-brain-init/SKILL.md` → found.
- `grep -iE "registry|vaults add|print-schema|second-brain init|--config" skills/second-brain-init/SKILL.md` → NO matches.

- [ ] **Step 8: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/SKILL.md
git commit -m "feat: wire usage thread + skill generation into SKILL.md (v1.1.0)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Update manifests — version 1.1.0 + descriptions

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Update `plugin.json`**

Set `"version"` to `"1.1.0"`. Replace `"description"` with:
`"Interviews you about your workflow, then creates a tailored knowledge-base vault AND stands up Claude Code skills to maintain and use it — folders, README, schema, templates, an AI maintenance contract, and ready-to-run skills, directly in your workspace."`

- [ ] **Step 2: Update `marketplace.json`**

Set the top-level `"version"` and the plugin entry `"version"` to `"1.1.0"`. Replace the plugin entry `"description"` with:
`"Set up a second-brain via a workflow interview or by ingesting existing notes. Self-contained — creates the full vault structure plus a baseline set of vault-maintenance and usage skills in .claude/skills/."`

- [ ] **Step 3: Verify**

Run:
- `node -e "['.claude-plugin/plugin.json','.claude-plugin/marketplace.json'].forEach(f=>JSON.parse(require('fs').readFileSync(f,'utf8')));console.log('OK')"` → `OK`.
- `grep -F "1.1.0" .claude-plugin/plugin.json .claude-plugin/marketplace.json | wc -l` → `>= 3`.
- `grep -iE "\bCLI\b" .claude-plugin/plugin.json .claude-plugin/marketplace.json` → NO matches.

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump to 1.1.0; manifests mention generated skills

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Update `README.md` — document generated skills

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a "Generated skills" section + update structure/usage**

Read the file. Make these changes:
1. In the "What this plugin is" / Usage area, add that setup now also runs a usage-thread interview and stands up Claude Code skills in `.claude/skills/`.
2. Add the `.claude/skills/` folder to the vault-structure tree in the README.
3. Add a "Skills your vault ships with" section listing the five baseline skills (vault-doctor, update-index, ingest-inbox, weekly-review, recall) with one-line descriptions, and noting that workflow-tailored skills may also be generated. Explain they run in Claude Code (open the vault folder) and are invoked by asking (e.g. "ingest my inbox").
4. Update the "What it doesn't do" if needed (still: does not maintain the wiki itself beyond the skills you invoke; does not run inside Obsidian).

MUST NOT introduce CLI/registry references.

- [ ] **Step 2: Verify**

Run:
- `grep -F ".claude/skills/" README.md` → found.
- `grep -E "vault-doctor|ingest-inbox|weekly-review|recall|update-index" README.md` → all five present (run: `grep -oE "vault-doctor|update-index|ingest-inbox|weekly-review|recall" README.md | sort -u | wc -l` → `5`).
- `grep -iE "npm install|print-schema|--config|registry|vaults|\bCLI\b" README.md` → NO matches.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add README.md
git commit -m "docs: document workflow interview + generated vault skills

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Consistency sweep + dry-run validation

**Files:**
- None modified unless issues are found.

- [ ] **Step 1: Repo-wide stale-reference + placeholder scan**

Run (from repo root):
- `grep -riE "registry\.md|vaults\.json|vaults add|print-schema|--config|--directory|user-directed" --include="*.md" --include="*.json" . | grep -v docs/superpowers/` → expect no matches.
- Confirm no baseline skill template has stray placeholders beyond the allowed ones:
  `for f in vault-doctor update-index ingest-inbox weekly-review recall; do echo "== $f =="; grep -oE "\{\{[a-zA-Z]+\}\}" skills/second-brain-init/references/skill-library/$f.md | sort -u; done`
  Expected: only `{{projectName}}` (and `{{domain}}` for ingest-inbox and recall).

- [ ] **Step 2: Frontmatter validity of every baseline template**

Run this node check (validates each template starts with YAML frontmatter containing `name` + `description`):

```bash
node -e '
const fs=require("fs");
const dir="skills/second-brain-init/references/skill-library";
let ok=true;
for(const f of fs.readdirSync(dir)){
  const t=fs.readFileSync(dir+"/"+f,"utf8");
  const m=t.match(/^---\n([\s\S]*?)\n---/);
  if(!m){console.log("NO FRONTMATTER:",f);ok=false;continue;}
  if(!/\nname:|\bname:/.test(m[1])||!/description:/.test(m[1])){console.log("MISSING name/description:",f);ok=false;}
}
console.log(ok?"FRONTMATTER OK":"FRONTMATTER FAIL");
'
```
Expected: `FRONTMATTER OK`.

- [ ] **Step 3: DRY-RUN — generate a real vault and assert the skills exist**

Simulate what the skill does at generation time: substitute `{{projectName}}`/`{{domain}}` into each baseline template and write to a temp vault's `.claude/skills/`. Then assert the files exist, have valid frontmatter, and carry no unresolved placeholders.

```bash
node -e '
const fs=require("fs"), os=require("os"), path=require("path");
const src="skills/second-brain-init/references/skill-library";
const vault=fs.mkdtempSync(path.join(os.tmpdir(),"sb-dryrun-"));
const subs={ "{{projectName}}":"Dry Run KB", "{{domain}}":"test domain notes" };
let problems=[];
for(const f of fs.readdirSync(src)){
  const name=f.replace(/\.md$/,"");
  let t=fs.readFileSync(path.join(src,f),"utf8");
  for(const [k,v] of Object.entries(subs)) t=t.split(k).join(v);
  const outDir=path.join(vault,".claude","skills",name);
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,"SKILL.md"),t);
  const left=t.match(/\{\{[a-zA-Z]+\}\}/g);
  if(left) problems.push(name+" has unresolved placeholders: "+left.join(","));
  if(!/^---\n[\s\S]*?name:\s*\S+[\s\S]*?description:[\s\S]*?\n---/.test(t)) problems.push(name+" bad frontmatter");
}
const made=fs.readdirSync(path.join(vault,".claude","skills")).sort();
const expected=["ingest-inbox","recall","update-index","vault-doctor","weekly-review"];
const missing=expected.filter(e=>!made.includes(e));
if(missing.length) problems.push("missing skills: "+missing.join(","));
console.log("Generated:",made.join(", "));
console.log("Vault:",vault);
console.log(problems.length?("DRY-RUN FAIL:\n"+problems.join("\n")):"DRY-RUN PASS");
'
```
Expected: `Generated: ingest-inbox, recall, update-index, vault-doctor, weekly-review` and `DRY-RUN PASS`.

If `DRY-RUN FAIL`, fix the offending template(s) (Tasks 3–7) and re-run.

- [ ] **Step 4: Reference-file integrity**

Run:
- `for f in vault-structure contract-template page-templates interview-script ingest-heuristics example-configs skill-generation workflow-interview; do test -f "skills/second-brain-init/references/$f.md" && echo "$f OK" || echo "$f MISSING"; done` → all `OK`.
- `ls skills/second-brain-init/references/skill-library/ | sort` → exactly `ingest-inbox.md  recall.md  update-index.md  vault-doctor.md  weekly-review.md`.

- [ ] **Step 5: Commit any fixes**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add -A
git commit -m "chore: consistency sweep + dry-run validation for v1.1.0 skills

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Two-thread interview (structure + usage) → Tasks 9, 10, 11. ✓
- Baseline skill library (5 skills) → Tasks 3–7. ✓
- Tailored skill generation (fixed shape + guardrails) → Task 8. ✓
- Skills in `<vault>/.claude/skills/` + runtime config read → Tasks 1, 3–8, 11, 14. ✓
- `.second-brain.json` `skills` + `usageProfile` → Tasks 1, 8, 11. ✓
- "Available skills" in contract → Task 2. ✓
- Confirm-gate + generate-step wiring → Task 11. ✓
- Manifests + README + version 1.1.0 → Tasks 11, 12, 13. ✓
- Dry-run validation → Task 14. ✓
- Fast path skips usage thread → Tasks 9, 11. ✓

**Placeholder scan:** No "TBD/TODO/handle appropriately" steps. Verbatim frontmatter for all five skills and the schema/contract additions; content specs for the longer bodies are explicit (required sections enumerated). ✓

**Type/name consistency:** Skill names (`vault-doctor`, `update-index`, `ingest-inbox`, `weekly-review`, `recall`), the allowed baked placeholders (`{{projectName}}` everywhere; `{{domain}}` only in `ingest-inbox` + `recall`), `{{skillsList}}`, the schema fields (`skills` with `{name,kind,description}`, `usageProfile.{regularActivities,aiResponsibilities,tailoredSkills}`), and the path `.claude/skills/<name>/SKILL.md` are used identically across Tasks 1, 2, 3–8, 11, 14. The dry-run's expected skill list matches the five templates. ✓
