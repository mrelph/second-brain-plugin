# Design: Refactor `second-brain-init` into a self-contained vault generator

**Date:** 2026-06-06
**Status:** Approved (design phase)
**Plugin version target:** 1.0.0

## Summary

Refactor the `second-brain` Claude Code plugin so its single skill,
`second-brain-init`, stops being a front-end to the external `second-brain` CLI
and instead **creates the entire vault itself**. The skill walks the user
through design options (adaptively), then writes every artifact directly with the
Write tool: the folder taxonomy, `README.md`, the `.second-brain.json` design
record, the three-block assistant contract (`AGENTS.md` + `CLAUDE.md`), page
templates, and domain-flavored example seed pages.

The plugin becomes fully self-contained — no external CLI dependency.

## Goals

- Help a user go from "I want a second brain for X" to a working, well-structured
  vault entirely within Claude Code.
- Walk the user through the real design decisions, guided but not tedious.
- Generate a vault that the AI assistant will actively *maintain*, via a rich
  instruction contract.

## Non-goals

- No external `second-brain` CLI dependency (removed).
- No vault registry (`~/.second-brain/vaults.json`) — dropped; Claude Code's
  native `CLAUDE.md` discovery covers the common case.
- No "register an existing vault" mode (depended on the registry).
- The skill does not *maintain* the wiki after setup — that is the assistant's
  ongoing job, governed by the generated contract.

## Key decisions (from brainstorming)

1. **Self-contained.** The skill replaces the CLI and creates everything itself.
2. **Format designed fresh** in the plugin's reference files (no CLI-format
   compatibility to preserve). The reference files become the source of truth for
   the vault format and the assistant contract.
3. **Rich 3-block contract** retained (Managed / Project Customizations /
   Assistant Observations).
4. **Scope:** keep **ingest mode**, **page templates**, and **example seed
   pages**. Drop the registry and register-existing mode.
5. **Adaptive walkthrough:** structured `AskUserQuestion` cards for decisions with
   real trade-offs; plain conversation for free-text fields. A "use sensible
   defaults / skip the questions" fast path is offered (not the default).
6. **Hybrid taxonomy:** numbered PARA-style activity areas at the top level for
   working material, plus an unnumbered `wiki/` for distilled, interlinked
   permanent notes.
7. **Architecture:** mirror the current skill architecture (lean `SKILL.md`
   orchestrator + progressive-disclosure `references/`); swap the "run the CLI"
   step for direct generation.

## Vault structure (generated)

```
<vault>/
├── .second-brain.json          # design record (domain, entity types, link style, formatVersion, …)
├── README.md                   # what this is, the folder taxonomy, how to use it
├── AGENTS.md                   # canonical 3-block assistant contract
├── CLAUDE.md                   # one-liner importing @AGENTS.md (native Claude Code pickup)
├── 01 - Steering/              # guiding docs — vision, principles, scope, style guide
│   └── _example-steering.md    # starter (real) content — "starter — edit me"
├── 02 - Research/
│   └── _example-research.md
├── 03 - Meeting Notes/
│   └── _example-meeting.md
├── 04 - Projects/
│   └── _example-project.md
├── 05 - Big Ideas/
│   └── _example-big-idea.md
├── 06 - People/
│   └── _example-person.md
├── wiki/                       # distilled, interlinked permanent notes (the knowledge graph)
│   ├── entities/
│   ├── concepts/
│   ├── topics/
│   └── _example-entity.md      # the single seed page, "delete me"
├── sources/
│   ├── inbox/                  # drop raw material here
│   └── archive/                # processed material (if archive-after-ingest)
└── templates/                  # copied by the assistant when creating new pages
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

Notes:

- **Only the activity areas are numbered** (01–06). `wiki/`, `sources/`, and
  `templates/` stay unnumbered alongside.
- **Numbered areas are the default example set.** The walkthrough lets the user
  rename/add/drop them and customize the `wiki/` categories.
- **`06 - People`** (a directory of people you interact with) coexists with
  `wiki/entities/` (distilled, interlinked entity pages). The README and contract
  explain the distinction.
- Folders that would otherwise be empty get a `.gitkeep`.

## `.second-brain.json` (design record)

Skill-owned, machine-readable statement of design intent. Nothing executes it,
but the assistant re-reads it for context and a future regenerator can read it.

Fields: `projectName`, `defaultAgent`, `formatVersion`,
`schema.{domain, entityTypes, commonQueries, styleGuide}`, `categories`
(activity areas + wiki categories), `wiki.{linkStyle, frontmatter, pageNaming}`,
`sourceHandling.mode`.

## Walkthrough flow

Mode detected by what's on disk at the target path:

- **Ingest mode** — target has notes but no `.second-brain.json`: read 5–15
  representative files, infer the design, present it, let the user correct, then
  create the structure *around* the existing material (never overwriting).
- **Interview mode** (default) — fresh/empty target: run the walkthrough.

Sequence:

1. **Pre-flight** — resolve target location (default: cwd). Verify it is not
   already a vault (no existing `.second-brain.json`).
2. **Conversational (free-text):** project name → domain (push for specifics) →
   entity types → common queries → style guide. Batched 2–3 at a time.
3. **Structured cards (`AskUserQuestion`):**
   - Link style — wikilinks vs markdown
   - Which activity areas — confirm/edit the default six
   - Source handling — `archive-after-ingest` vs `leave-in-inbox`
   - Frontmatter + page naming — only if not already implied
4. **Confirm gate** — show the full plan (`.second-brain.json`, folder tree, file
   list). The **last reversible point** before anything is written.
5. **Generate** — create folders + artifacts via the Write tool.
6. **Hand off** — summarize; point to `sources/inbox/` and three next actions;
   explain `AGENTS.md`/`CLAUDE.md` now governs maintenance.

A **fast path** ("use sensible defaults, skip the questions") is offered up front.

## Assistant contract (`AGENTS.md`)

Three blocks delimited by HTML-comment markers so a regenerator can replace one
region without clobbering the others:

```markdown
<!-- BEGIN MANAGED: second-brain v1 — regenerated on setup, edit below instead -->
…maintenance rules (skill-owned)…
<!-- END MANAGED -->

<!-- BEGIN PROJECT CUSTOMIZATIONS — yours to edit; preserved across regeneration -->
(empty)
<!-- END PROJECT CUSTOMIZATIONS -->

<!-- BEGIN ASSISTANT OBSERVATIONS — the assistant's working memory; appended over time -->
(empty)
<!-- END ASSISTANT OBSERVATIONS -->
```

**MANAGED block contents:**

- **Purpose** — the domain, in the user's words.
- **Taxonomy & where things go** — distinguishes numbered activity areas (working
  material) from `wiki/` (distilled permanent notes) from `sources/` (raw intake).
  Most important section; prevents the People-vs-entities confusion.
- **Capture→distill loop** — material lands in `sources/inbox/` → filed into the
  right area → durable knowledge distilled into linked `wiki/` pages → (if
  `archive-after-ingest`) source moves to `sources/archive/`.
- **Conventions** — link style, page naming, frontmatter, "always create pages
  from `templates/`."
- **Linking discipline** — link liberally; a `[[link]]` to a non-existent page is
  a valid TODO marker.
- **Style guide** — the user's, inlined.

**Regeneration:** no CLI `upgrade` exists, but the markers are kept. The MANAGED
block is written once at setup; a future skill version (or the user) can
regenerate just that block while preserving the two user/assistant blocks.
Documented honestly as "regenerate-capable, not auto-upgraded."

`CLAUDE.md` is a one-line file importing `@AGENTS.md`. The user's `defaultAgent`
choice can flip which file is canonical.

## Templates & seed content

**Templates** are generated *tailored to the user's design* (link style,
frontmatter on/off, naming) — not static copies. Skeletons:

| Template | Skeleton |
|---|---|
| `steering.md` | purpose, scope/boundaries, guiding principles, related links |
| `research.md` | question, key findings, sources, open threads, wiki links |
| `meeting-note.md` | date, attendees (`[[people]]`), agenda, decisions, action items |
| `project.md` | status, goal, milestones, decisions log, linked research/people |
| `big-idea.md` | the idea in one line, why it matters, sparks/sources, next step |
| `person.md` | role, context, interactions log, links to projects/meetings |
| `entity.md` / `concept.md` / `topic.md` | definition, key facts, relationships, sources |

Templates keep `{{placeholders}}` for the assistant to fill later; the skill
substitutes real values only when *it* writes seed pages.

**Seed content:**

- One `_example-*.md` per numbered area and one `_example-entity.md` in `wiki/`.
- **Domain-flavored** — filled with realistic content using the user's actual
  domain, so they illustrate the intended style.
- Each opens with a clear marker: `> ⚠️ Example page — delete me once you've seen
  the format.`
- **Exception:** `01 - Steering/_example-steering.md` is seeded with a *real*
  lightweight starting steering doc (vision + scope from the interview), marked
  "starter — edit me" rather than "delete me."

## Plugin repo changes

| File | Change |
|---|---|
| `skills/second-brain-init/SKILL.md` | Rewrite. New workflow; remove CLI pre-flight, `--print-schema`, run-CLI, register mode. Rewrite description (drop register/CLI triggers). |
| `references/interview-script.md` | Update for adaptive flow, numbered taxonomy, fast path. |
| `references/ingest-heuristics.md` | Keep; remap inferences onto new structure. Fix stale `user-directed` default. |
| `references/example-configs.md` | Update to new `.second-brain.json` shape; keep as design inspiration. |
| `references/vault-structure.md` | **New.** Canonical layout + `.second-brain.json` schema. |
| `references/contract-template.md` | **New.** 3-block `AGENTS.md` template + `CLAUDE.md` import. |
| `references/page-templates.md` | **New.** Template skeletons + seed-page guidance. |
| `references/registry.md` | **Delete.** |
| `.claude-plugin/plugin.json` + `marketplace.json` | Rewrite descriptions (remove CLI references), drop prereq framing, bump to 1.0.0. |
| `README.md` | Rewrite: self-contained behavior, new structure, no CLI prerequisite/install. |

## Generation mechanics

- All files written with the **Write tool** (handles spaces in `01 - Steering/`;
  auto-creates parent dirs). Empty folders get a `.gitkeep`.
- Write order: config → README → `AGENTS.md`/`CLAUDE.md` → templates → seed pages
  → `.gitkeep`s.
- `git init` offered (default yes).
- **Ingest mode never overwrites.** It scaffolds around existing files and
  *suggests* (does not perform) filing them.

## Error handling / edge cases

- **Target non-empty in interview mode** → surface it; ask how to proceed (new
  dir? proceed anyway? is it ingest?). Never silently write into a populated dir.
- **Target is `.git`-only** → treat as empty-enough; proceed.
- **Existing `.second-brain.json` at target** → already a vault; stop and inform
  (no re-init; register mode was dropped).
- **Write/permission failure mid-generation** → report which artifacts were
  created so the user can clean up; do not claim success.

## Open follow-ups (out of scope here)

- A future "regenerate the MANAGED block" command/skill.
- Optional later reintroduction of a registry if multi-vault discovery becomes a
  pain point.
