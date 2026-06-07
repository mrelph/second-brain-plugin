# Self-Contained Vault Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `second-brain-init` skill so it generates a complete second-brain vault itself (folders, README, `.second-brain.json`, 3-block `AGENTS.md`/`CLAUDE.md`, templates, domain-flavored seed pages) with no external CLI dependency.

**Architecture:** Keep the current architecture — a lean `SKILL.md` orchestrator plus progressive-disclosure `references/`. Replace the "run the CLI" step with direct generation via the Write tool. Reference files become the source of truth for the vault format and assistant contract. Drop the CLI dependency, the vault registry, and register-existing mode.

**Tech Stack:** Markdown skill files (no executable code, no test harness). Verification is done via `grep`/read consistency checks. Vault generation at runtime uses the Write tool.

**Source spec:** `docs/superpowers/specs/2026-06-06-second-brain-vault-generator-design.md`

---

## File Structure

Files created/modified in this plan (all under repo root `/mnt/c/Coding/second-brain-plugin`):

- **New:** `skills/second-brain-init/references/vault-structure.md` — canonical folder layout + `.second-brain.json` schema.
- **New:** `skills/second-brain-init/references/contract-template.md` — the 3-block `AGENTS.md` template + `CLAUDE.md` import line.
- **New:** `skills/second-brain-init/references/page-templates.md` — template skeletons + seed-page generation guidance.
- **Modify:** `skills/second-brain-init/references/example-configs.md` — new `.second-brain.json` shape with taxonomy.
- **Modify:** `skills/second-brain-init/references/ingest-heuristics.md` — remap onto new structure; fix stale `user-directed` default.
- **Rewrite:** `skills/second-brain-init/references/interview-script.md` — adaptive flow, numbered taxonomy, fast path.
- **Delete:** `skills/second-brain-init/references/registry.md`.
- **Rewrite:** `skills/second-brain-init/SKILL.md` — new workflow + description.
- **Modify:** `.claude-plugin/plugin.json` — description, version 1.0.0.
- **Modify:** `.claude-plugin/marketplace.json` — plugin description, version 1.0.0.
- **Rewrite:** `README.md` — self-contained behavior, new structure.

**Build order rationale:** Write the format references first (vault-structure, contract-template, page-templates), so the orchestrator `SKILL.md` can point at concrete files. Then update the supporting references, delete the obsolete one, rewrite `SKILL.md`, then the manifests and README, then a final consistency sweep.

---

## Task 1: New reference — `vault-structure.md`

**Files:**
- Create: `skills/second-brain-init/references/vault-structure.md`

- [ ] **Step 1: Write the file**

It MUST contain, verbatim, this folder tree in a fenced code block:

```
<vault>/
├── .second-brain.json
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── 01 - Steering/
├── 02 - Research/
├── 03 - Meeting Notes/
├── 04 - Projects/
├── 05 - Big Ideas/
├── 06 - People/
├── wiki/
│   ├── entities/
│   ├── concepts/
│   └── topics/
├── sources/
│   ├── inbox/
│   └── archive/
└── templates/
    ├── steering.md
    ├── research.md
    ├── meeting-note.md
    ├── project.md
    ├── big-idea.md
    ├── person.md
    ├── entity.md
    ├── concept.md
    └── topic.md
```

It MUST then document these rules as prose:
- Only activity areas are numbered (01–06); `wiki/`, `sources/`, `templates/` stay unnumbered.
- The numbered areas are the default example set; the walkthrough lets the user rename/add/drop them and customize `wiki/` categories.
- The distinction between `06 - People` (a directory of people you interact with) and `wiki/entities/` (distilled, interlinked entity pages).
- Empty folders get a `.gitkeep`.

It MUST contain the `.second-brain.json` schema as a verbatim annotated example:

```json
{
  "projectName": "string — human-readable name, appears in headings",
  "defaultAgent": "claude-code",
  "formatVersion": 1,
  "schema": {
    "domain": "one-sentence description of what this KB is about",
    "entityTypes": ["recurring kinds of wiki pages, e.g. authors, methods"],
    "commonQueries": ["sample questions with [placeholder] syntax"],
    "styleGuide": "tight, opinionated, concrete writing rules for the assistant"
  },
  "categories": {
    "activityAreas": ["01 - Steering", "02 - Research", "03 - Meeting Notes", "04 - Projects", "05 - Big Ideas", "06 - People"],
    "wikiCategories": ["entities", "concepts", "topics"]
  },
  "wiki": {
    "linkStyle": "wikilinks | markdown",
    "frontmatter": true,
    "pageNaming": "title-case | kebab-case | sentence-case"
  },
  "sourceHandling": {
    "mode": "archive-after-ingest | leave-in-inbox"
  }
}
```

It MUST note: nothing executes this file at runtime; it is a machine-readable design record the assistant re-reads for intent, and a hook for a future regenerator.

- [ ] **Step 2: Verify structure present**

Run: `grep -c "01 - Steering" skills/second-brain-init/references/vault-structure.md`
Expected: `>= 1` (tree present).

Run: `grep -E "formatVersion|activityAreas|wikiCategories|linkStyle|sourceHandling" skills/second-brain-init/references/vault-structure.md`
Expected: all five tokens found.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/vault-structure.md
git commit -m "feat: add vault-structure reference (canonical layout + schema)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: New reference — `contract-template.md`

**Files:**
- Create: `skills/second-brain-init/references/contract-template.md`

- [ ] **Step 1: Write the file**

It MUST contain the canonical `AGENTS.md` skeleton verbatim, with the three comment-delimited blocks:

```markdown
# {{projectName}} — Second Brain

<!-- BEGIN MANAGED: second-brain v1 — regenerated on setup, edit below instead -->

## Purpose
{{domain, in the user's words}}

## How this brain is organized
- **Numbered activity areas (01–06)** hold working material: steering docs, research, meeting notes, projects, big ideas, people.
- **`wiki/`** holds distilled, interlinked permanent notes (entities, concepts, topics) — the knowledge graph.
- **`sources/`** is raw intake: drop material in `sources/inbox/`.

## The capture → distill loop
1. New material lands in `sources/inbox/`.
2. File it into the right numbered area.
3. Distill durable knowledge into linked pages under `wiki/`.
4. {{if archive-after-ingest}} Move the processed source to `sources/archive/`. {{else}} Leave the source in `sources/inbox/`. {{endif}}

## Conventions
- Link style: {{wikilinks → [[Page]] | markdown → [Page](page.md)}}.
- Page naming: {{pageNaming}}.
- Frontmatter: {{on → include YAML frontmatter | off → omit it}}.
- Always create new pages by copying the matching file in `templates/`.

## Linking discipline
Link liberally. A link to a page that does not exist yet is a valid TODO marker — it records something worth writing later.

## Style guide
{{styleGuide}}

<!-- END MANAGED -->

<!-- BEGIN PROJECT CUSTOMIZATIONS — yours to edit; preserved across regeneration -->

(empty — add your own preferences here)

<!-- END PROJECT CUSTOMIZATIONS -->

<!-- BEGIN ASSISTANT OBSERVATIONS — the assistant's working memory; appended over time -->

(empty — the assistant records cross-session notes here)

<!-- END ASSISTANT OBSERVATIONS -->
```

It MUST contain the `CLAUDE.md` content verbatim:

```markdown
@AGENTS.md
```

It MUST document:
- The three blocks' ownership model (machine / user / assistant) and that the comment markers are how a regenerator replaces only the MANAGED block.
- That `AGENTS.md` is canonical and `CLAUDE.md` imports it; if `defaultAgent` is not `claude-code`, the canonical/import roles may flip (write the contract to the agent's expected filename, import from the other).
- "Regenerate-capable, not auto-upgraded": the MANAGED block is written once at setup; no CLI upgrade exists.
- How the skill substitutes each `{{placeholder}}` from the config at generation time.

- [ ] **Step 2: Verify markers present**

Run: `grep -E "BEGIN MANAGED|END MANAGED|BEGIN PROJECT CUSTOMIZATIONS|BEGIN ASSISTANT OBSERVATIONS" skills/second-brain-init/references/contract-template.md`
Expected: all four markers found.

Run: `grep -F "@AGENTS.md" skills/second-brain-init/references/contract-template.md`
Expected: found.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/contract-template.md
git commit -m "feat: add contract-template reference (3-block AGENTS.md + CLAUDE.md)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: New reference — `page-templates.md`

**Files:**
- Create: `skills/second-brain-init/references/page-templates.md`

- [ ] **Step 1: Write the file**

It MUST contain a section per template with a concrete skeleton. Each skeleton MUST be tailored at generation time to link style and frontmatter setting; the reference shows the wikilinks + frontmatter-on variant and notes the markdown variant in prose.

Required template skeletons (each as a fenced code block):

`templates/steering.md`:
```markdown
---
type: steering
created: {{date}}
tags: []
---
# {{title}}

## Purpose

## Scope & boundaries

## Guiding principles

## Related
- [[ ]]
```

`templates/research.md`:
```markdown
---
type: research
created: {{date}}
tags: []
---
# {{title}}

## Question

## Key findings

## Sources

## Open threads

## Related
- [[ ]]
```

`templates/meeting-note.md`:
```markdown
---
type: meeting-note
date: {{date}}
attendees: []
tags: []
---
# {{title}}

## Attendees
- [[ ]]

## Agenda

## Decisions

## Action items
- [ ]
```

`templates/project.md`:
```markdown
---
type: project
created: {{date}}
status: active
tags: []
---
# {{title}}

## Goal

## Status

## Milestones
- [ ]

## Decisions log

## Related
- [[ ]]
```

`templates/big-idea.md`:
```markdown
---
type: big-idea
created: {{date}}
tags: []
---
# {{title}}

## The idea (one line)

## Why it matters

## Sparks & sources

## Next step
```

`templates/person.md`:
```markdown
---
type: person
created: {{date}}
tags: []
---
# {{title}}

## Role & context

## Interactions

## Related
- [[ ]]
```

`templates/entity.md`, `templates/concept.md`, `templates/topic.md` (note the `type:` differs per file):
```markdown
---
type: entity
created: {{date}}
tags: []
---
# {{title}}

## Definition

## Key facts

## Relationships
- [[ ]]

## Sources
```

It MUST contain seed-page guidance:
- One `_example-*.md` per numbered area and one `_example-entity.md` in `wiki/`.
- Seed pages are **domain-flavored**: filled with realistic content drawn from the user's actual domain/entity types.
- Every seed page (except steering) opens with: `> ⚠️ Example page — delete me once you've seen the format.`
- `01 - Steering/_example-steering.md` is special: seed it with a *real* lightweight steering doc (vision + scope from the interview answers), opening with `> ✏️ Starter — edit me.` instead of the delete marker.
- The markdown (non-wikilinks) variant uses `[Text](file.md)` for the `Related` links and drops nothing else.
- Frontmatter-off variant: omit the `---` block entirely.

- [ ] **Step 2: Verify all templates documented**

Run: `grep -E "templates/(steering|research|meeting-note|project|big-idea|person|entity|concept|topic)\.md" skills/second-brain-init/references/page-templates.md | sort -u | wc -l`
Expected: `9`.

Run: `grep -F "Example page — delete me" skills/second-brain-init/references/page-templates.md`
Expected: found.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/page-templates.md
git commit -m "feat: add page-templates reference (skeletons + seed-page guidance)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Update `example-configs.md` to the new schema shape

**Files:**
- Modify: `skills/second-brain-init/references/example-configs.md`

- [ ] **Step 1: Rewrite each example config to the new shape**

Every example MUST use the Task 1 schema (with `formatVersion`, `categories.activityAreas`, `categories.wikiCategories`). Keep the four domain examples (research, journal, recipes, engineering) plus the minimal example, but update each to the new shape. Example — the research config MUST become:

```json
{
  "projectName": "AI Alignment Research",
  "defaultAgent": "claude-code",
  "formatVersion": 1,
  "schema": {
    "domain": "AI alignment research papers, authors, and the arguments they make",
    "entityTypes": ["papers", "authors", "concepts", "methods"],
    "commonQueries": [
      "What has [author] said about [concept]?",
      "Which papers cite [paper]?"
    ],
    "styleGuide": "Concise. Cite sources inline. Mark synthesis vs sourced facts explicitly."
  },
  "categories": {
    "activityAreas": ["01 - Steering", "02 - Research", "03 - Meeting Notes", "04 - Projects", "05 - Big Ideas", "06 - People"],
    "wikiCategories": ["entities", "concepts", "topics"]
  },
  "wiki": { "linkStyle": "wikilinks", "frontmatter": true, "pageNaming": "title-case" },
  "sourceHandling": { "mode": "archive-after-ingest" }
}
```

- [ ] **Step 2: Remove every `user-directed` occurrence**

The only valid `sourceHandling.mode` values are `archive-after-ingest` and `leave-in-inbox`.

Run: `grep -c "user-directed" skills/second-brain-init/references/example-configs.md`
Expected: `0`.

- [ ] **Step 3: Verify new shape used**

Run: `grep -c "activityAreas" skills/second-brain-init/references/example-configs.md`
Expected: `>= 4` (each non-minimal example carries it; minimal example may omit and rely on defaults — acceptable).

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/example-configs.md
git commit -m "refactor: update example-configs to new taxonomy schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Update `ingest-heuristics.md`

**Files:**
- Modify: `skills/second-brain-init/references/ingest-heuristics.md`

- [ ] **Step 1: Remap inference targets onto the new structure**

Keep the "what to read" and "what to infer" guidance, but update the inference targets:
- `schema.entityTypes` inference now maps to `categories.wikiCategories` candidates AND `entityTypes`.
- Add guidance: infer which **activity areas** apply by looking at folder substructure and content (e.g. a `meetings/` folder → keep `03 - Meeting Notes`; no project material → still offer `04 - Projects` as a default but flag it as unused).
- Add: ingest creates the scaffold **around** existing files and never overwrites; it *suggests* (does not perform) filing existing files into areas.

- [ ] **Step 2: Fix the stale `sourceHandling.mode` default**

Find the line stating the default is `user-directed` and change it to: default `archive-after-ingest`; set `leave-in-inbox` if the user prefers to keep everything visible.

Run: `grep -c "user-directed" skills/second-brain-init/references/ingest-heuristics.md`
Expected: `0`.

- [ ] **Step 3: Verify new targets referenced**

Run: `grep -E "activity area|wikiCategories|never overwrite" skills/second-brain-init/references/ingest-heuristics.md`
Expected: at least the overwrite-safety note and activity-area guidance present.

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/ingest-heuristics.md
git commit -m "refactor: remap ingest heuristics to new structure; fix stale default

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Rewrite `interview-script.md`

**Files:**
- Rewrite: `skills/second-brain-init/references/interview-script.md`

- [ ] **Step 1: Write the adaptive walkthrough script**

It MUST contain:
- A **fast-path** note up front: offer "use sensible defaults / skip the questions" before the interview; if accepted, apply the minimal config (project name + domain + all defaults) and go straight to the confirm gate.
- **Conversational (free-text) questions**, batched 2–3 at a time, mapping to: `projectName`, `schema.domain` (push for specifics), `schema.entityTypes`, `schema.commonQueries`, `schema.styleGuide`.
- **Structured-card decisions** (note these are asked via `AskUserQuestion`): link style (wikilinks vs markdown), which activity areas (confirm/edit the default six), source handling (`archive-after-ingest` vs `leave-in-inbox`), and frontmatter + page naming (only if not already implied).
- A **defaults table** listing silent defaults: `defaultAgent: claude-code`, `formatVersion: 1`, `wiki.frontmatter: true`, `wiki.pageNaming: title-case`, default activity areas (the six), default wiki categories (`entities`, `concepts`, `topics`), `sourceHandling.mode: archive-after-ingest`, git init: true.
- An updated worked example interaction reflecting the new taxonomy and the confirm gate.

It MUST NOT mention the CLI, `--print-schema`, or register mode.

- [ ] **Step 2: Verify no stale references**

Run: `grep -iE "print-schema|second-brain init|register|vaults add" skills/second-brain-init/references/interview-script.md`
Expected: no matches.

Run: `grep -E "fast.?path|archive-after-ingest|activity area" skills/second-brain-init/references/interview-script.md`
Expected: all present.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/references/interview-script.md
git commit -m "refactor: rewrite interview-script for adaptive walkthrough + taxonomy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Delete `registry.md`

**Files:**
- Delete: `skills/second-brain-init/references/registry.md`

- [ ] **Step 1: Delete the file**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git rm skills/second-brain-init/references/registry.md
```

- [ ] **Step 2: Verify gone**

Run: `test -f skills/second-brain-init/references/registry.md && echo PRESENT || echo GONE`
Expected: `GONE`.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git commit -m "refactor: drop vault registry reference (registry removed)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Rewrite `SKILL.md`

**Files:**
- Rewrite: `skills/second-brain-init/SKILL.md`

- [ ] **Step 1: Rewrite the frontmatter description**

The `description` MUST trigger on setup phrasings ("set up a second-brain", "create a knowledge base", "build a personal wiki", "initialize second-brain", "organize my notes into a wiki", "start a second brain") and MUST include negative triggers (do NOT activate for "set up Obsidian", "create a new note", "make a wiki page", or queries about an existing vault that just needs opening). It MUST NOT mention register/registry/CLI. Bump `version` to `1.0.0`.

- [ ] **Step 2: Rewrite the workflow body**

The body MUST document this workflow, in order:
1. **Pre-flight: resolve the target location.** Default to cwd if unspecified. Run `test -f <path>/.second-brain.json && echo exists` — if it exists, stop and tell the user it is already a vault (no re-init). Run a non-empty check; in interview mode a non-empty target (other than a lone `.git`) means stop and ask how to proceed.
2. **Choose mode:** ingest (folder has notes, no config) vs interview (default). Point to `references/ingest-heuristics.md` and `references/interview-script.md`.
3. **Run the adaptive walkthrough** (or fast path). Reference `references/interview-script.md`.
4. **Construct the config** matching `references/vault-structure.md`. Reference `references/example-configs.md` for shapes.
5. **Confirm gate:** show the `.second-brain.json`, the folder tree, and the file list. State this is the last reversible point.
6. **Generate** via the Write tool, in this order: config → README → `AGENTS.md` → `CLAUDE.md` → templates → seed pages → `.gitkeep`s. Reference `references/contract-template.md` and `references/page-templates.md`. Offer `git init` (default yes). Note: write files with the Write tool (auto-creates parent dirs, handles spaces in `01 - Steering/`); empty folders get a `.gitkeep`. Ingest mode never overwrites existing files.
7. **Hand off:** summarize what was created; point to `sources/inbox/` and three next actions; explain `AGENTS.md`/`CLAUDE.md` now governs maintenance and the user can edit the Project Customizations block.

The body MUST include a "What this skill does NOT do" section: it does not maintain the wiki, does not re-init existing vaults, and does not pre-populate `wiki/` beyond the single example seed page.

It MUST list the four reference files (vault-structure, contract-template, page-templates, interview-script, ingest-heuristics, example-configs) and MUST NOT reference `registry.md` or the CLI.

- [ ] **Step 3: Verify no stale references**

Run: `grep -iE "registry|vaults add|print-schema|which second-brain|second-brain init|--config|--directory" skills/second-brain-init/SKILL.md`
Expected: no matches.

Run: `grep -E "Write tool|confirm|\.gitkeep|ingest|fast" skills/second-brain-init/SKILL.md`
Expected: present.

Run: `grep -E "registry.md" skills/second-brain-init/SKILL.md`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add skills/second-brain-init/SKILL.md
git commit -m "refactor: rewrite SKILL.md for self-contained vault generation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Update `plugin.json` and `marketplace.json`

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Update `plugin.json`**

Set `version` to `1.0.0`. Replace `description` with one that does not mention the CLI, e.g.: `"Walks you through designing a personal knowledge base, then creates the whole vault — folders, README, schema, templates, and an AI maintenance contract — directly in your workspace."`

- [ ] **Step 2: Update `marketplace.json`**

Set the top-level marketplace `version` and the plugin entry `version` to `1.0.0`. Replace the plugin entry `description` to drop "Calls the second-brain CLI under the hood" and the register-existing language, e.g.: `"Set up a new second-brain knowledge base via an interactive design walkthrough or by ingesting existing notes. Self-contained — creates the full vault structure directly."`

- [ ] **Step 3: Verify valid JSON and no CLI references**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8')); console.log('OK')"`
Expected: `OK`.

Run: `grep -iE "CLI|register" .claude-plugin/plugin.json .claude-plugin/marketplace.json`
Expected: no matches.

Run: `grep -F "1.0.0" .claude-plugin/plugin.json .claude-plugin/marketplace.json | wc -l`
Expected: `>= 3` (plugin version + marketplace version + plugin-entry version).

- [ ] **Step 4: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump to 1.0.0; drop CLI/register from manifests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Rewrite `README.md`

**Files:**
- Rewrite: `README.md`

- [ ] **Step 1: Rewrite the README**

It MUST:
- Describe the plugin as a self-contained vault generator (no CLI prerequisite, no install-the-CLI section, no `second-brain --version` check).
- Keep the Installation section (the `/plugin marketplace add` + `/plugin install` steps are unchanged).
- Document the generated vault structure (the Task 1 tree).
- Explain the hybrid taxonomy (numbered activity areas vs `wiki/`), the 3-block contract, templates, and the domain-flavored seed pages.
- Keep a "What it doesn't do" section: does not maintain the wiki (the contract governs that), does not re-init existing vaults.
- Update the Architecture diagram to show plugin → generated vault directly (no CLI box).

It MUST NOT mention: the `second-brain` CLI, `npm install -g github:mrelph/second-brain`, `--print-schema`, `--config`, the vault registry, or register-existing mode.

- [ ] **Step 2: Verify no stale references**

Run: `grep -iE "CLI|npm install|print-schema|--config|registry|vaults|register" README.md`
Expected: no matches.

Run: `grep -E "01 - Steering|wiki/|AGENTS.md|self-contained" README.md`
Expected: present.

- [ ] **Step 3: Commit**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add README.md
git commit -m "docs: rewrite README for self-contained vault generator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Final consistency sweep

**Files:**
- None modified unless the sweep finds issues.

- [ ] **Step 1: Repo-wide stale-reference scan**

Run: `grep -riE "registry\.md|vaults\.json|vaults add|print-schema|npm install -g github:mrelph|--config|--directory|user-directed|register-existing" --include="*.md" --include="*.json" . | grep -v docs/superpowers/`
Expected: no matches. (The `docs/superpowers/` specs/plans are historical and may mention these terms.)

- [ ] **Step 2: Version consistency**

Run: `grep -rF "1.0.0" .claude-plugin/ skills/second-brain-init/SKILL.md`
Expected: `plugin.json`, `marketplace.json` (twice), and `SKILL.md` frontmatter all show `1.0.0`.

- [ ] **Step 3: JSON validity**

Run: `node -e "['.claude-plugin/plugin.json','.claude-plugin/marketplace.json'].forEach(f=>JSON.parse(require('fs').readFileSync(f,'utf8')));console.log('OK')"`
Expected: `OK`.

- [ ] **Step 4: Reference-link integrity**

Run: `for f in vault-structure contract-template page-templates interview-script ingest-heuristics example-configs; do test -f "skills/second-brain-init/references/$f.md" && echo "$f OK" || echo "$f MISSING"; done`
Expected: all six `OK`.

Run: `grep -oE "references/[a-z-]+\.md" skills/second-brain-init/SKILL.md | sort -u`
Expected: every listed file exists (cross-check against the six above; `registry.md` MUST NOT appear).

- [ ] **Step 5: Commit any fixes**

```bash
cd /mnt/c/Coding/second-brain-plugin && pwd
git add -A
git commit -m "chore: final consistency sweep for self-contained refactor

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" || echo "nothing to commit"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Self-contained generation → Tasks 1–3, 8. ✓
- Fresh format in references → Tasks 1–3. ✓
- 3-block contract → Task 2. ✓
- Scope (ingest, templates, seed pages; no registry) → Tasks 3, 5, 7. ✓
- Adaptive walkthrough + fast path → Task 6, 8. ✓
- Hybrid numbered taxonomy incl. `06 - People` → Tasks 1, 4, 6, 8, 10. ✓
- Mirror architecture, swap engine → Task 8. ✓
- `.second-brain.json` design record → Tasks 1, 4. ✓
- Manifest/README updates + 1.0.0 → Tasks 9, 10. ✓
- Error handling (non-empty target, existing config, never-overwrite) → Tasks 5, 8. ✓
- Fix stale `user-directed` default → Tasks 4, 5. ✓

**Placeholder scan:** No "TBD/TODO/handle appropriately" steps; verbatim schema, contract markers, and template skeletons supplied. ✓

**Type/name consistency:** `formatVersion`, `categories.activityAreas`, `categories.wikiCategories`, `sourceHandling.mode` values (`archive-after-ingest` / `leave-in-inbox`), the six activity-area names, and the three wiki categories are used identically across Tasks 1, 4, 6, 8, 10. ✓
