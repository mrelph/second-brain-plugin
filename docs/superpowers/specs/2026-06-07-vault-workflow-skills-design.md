# Design: Workflow-mapping interview + generated vault skills

**Date:** 2026-06-07
**Status:** Approved (design phase)
**Plugin version target:** 1.1.0
**Builds on:** 2026-06-06-second-brain-vault-generator-design.md (v1.0.0)

## Summary

Extend the self-contained `second-brain-init` skill so that, during setup, it
maps the user's workflow through an expanded interview and stands up a set of
executable Claude Code skills inside the vault, at `<vault>/.claude/skills/`.

The setup gains a second interview thread (usage, alongside the existing
structure thread), always generates a fixed **baseline** skill library (vault
maintenance, inbox ingestion, review & recall), and generates a few
**workflow-tailored** skills derived from the usage thread. Generated skills are
Obsidian-vault-aware and read `.second-brain.json` at runtime for live structure.

## Goals

- Interview the user about both how their content is organized (structure) and
  how they want to use the vault (usage).
- Stand up baseline skills that maintain and operate the vault.
- Generate a small number of tailored skills for the user's recurring workflows.
- Keep everything inside the existing setup flow (one trigger), not a separate
  step or a separately-installed plugin.

## Non-goals

- No quick-capture / new-page skill in the baseline (the human captures in
  Obsidian; the AI ingests, maintains, reviews, recalls). Dropped during
  brainstorming.
- No deep step/input/output process mapping or multi-step automation engine.
- No Obsidian-native helpers (templater, community-plugin config) — skills run in
  Claude Code; the vault merely stays Obsidian-compatible.
- No separate generator skill or companion plugin — skills live in the vault's
  `.claude/skills/`.

## Key decisions (from brainstorming)

1. **Generate real Claude Code skills** into `<vault>/.claude/skills/<name>/SKILL.md`.
   Vault content stays Obsidian-compatible; skills run in Claude Code.
2. **Fixed baseline + tailored additions.** Baseline always generated; tailored
   skills derive from the usage thread.
3. **Baseline bundles:** Vault maintenance, Inbox ingestion, Review & recall.
   (Capture & new-page intentionally excluded.)
4. **Two-thread interview:** structure (folder taxonomy + where content lives) and
   usage (how they want to use the vault). Usage drives tailored skills.
5. **Architecture:** mirror v1.0.0 — lean `SKILL.md` orchestrator + parameterized
   template library in `references/`. Baseline skills are a shipped template
   library, not freeform generation.
6. **Runtime config read:** generated skills read `.second-brain.json` at runtime
   for live structure; only wording/description is baked.

## Expanded two-thread interview

**Structure thread (enhanced existing interview):** beyond naming activity areas,
elicit *where content lives* and the inbox→area→wiki routing — e.g. "When you
capture a meeting, where does it land? Does it become a permanent wiki page?"
These routing rules parameterize `ingest-inbox` and `update-index`.

**Usage thread (new):** a few questions —
- "What will you do with this regularly?"
- "What do you want the AI to do for you?"
- "Any recurring process you'd want a one-word command for?"

**Outputs:**
1. The folder taxonomy (as v1.0.0), possibly refined.
2. A usage profile: confirmation that the three baseline bundles apply (always
   generated) + a short list of tailored skill candidates.

Stays adaptive (structured cards for forks, conversation for free-text). The fast
path still works: skip the usage thread → baseline skills only, no tailored
additions.

## Baseline skill library

Shipped as parameterized templates in `references/skill-library/`, written to
`<vault>/.claude/skills/<name>/SKILL.md`. Each reads `.second-brain.json` at
runtime; only wording + frontmatter `description` are baked.

**Vault maintenance**
- `vault-doctor` — scan for broken/orphaned wikilinks, frontmatter not matching
  templates, pages not linked from any index, empty stubs; report then offer to
  fix. Params: link style, frontmatter fields, activity areas, wiki categories.
- `update-index` — maintain Map-of-Content / index pages, one per activity area
  and wiki category, linking pages within. Params: areas, categories, link style,
  page naming.

**Inbox ingestion**
- `ingest-inbox` — capture→distill loop: read `sources/inbox/`, classify into the
  right activity area, create/append the area page from the matching template,
  distill durable knowledge into linked `wiki/` pages, then archive-or-leave per
  `sourceHandling.mode`. Params: areas, templates, link style, sourceHandling.mode,
  domain.

**Review & recall**
- `weekly-review` — summarize recent activity across areas (new/changed pages in a
  window), surface stale items and open loops (unchecked action items), prompt
  reflection, optionally write a review note. Params: areas, frontmatter date fields.
- `recall` — answer "what do we know about X?" by searching `wiki/` + areas,
  following links, synthesizing a cited answer with page references. Params: link
  style, domain, categories.

Each generated skill gets a tailored frontmatter `description` so it triggers
naturally in-vault (e.g. `ingest-inbox` on "ingest my inbox / process new notes").

## Tailored skill generation

Usage-thread answers surface recurring processes the baseline doesn't cover. Each
becomes a candidate tailored skill, authored by the model to a FIXED shape
(documented in `references/skill-generation.md`):

```
frontmatter: name (kebab-case), description (trigger phrases), version
body:
  ## Purpose      — one line
  ## When to use  — triggers / anti-triggers
  ## Steps        — procedure referencing the vault's real areas, templates,
                    link style (parameterized); may invoke baseline skills by name
  ## Output       — where results land (area / wiki page)
```

**Guardrails (YAGNI):**
- Only propose a tailored skill for a **recurring process with a distinct output**.
- When uncertain, do NOT generate — note the user can ask later.
- Every candidate shown at the confirm gate (name + trigger + behavior + output);
  user approves/edits/drops each individually.

## Placement, generation & config record

**Placement:** `<vault>/.claude/skills/<name>/SKILL.md` (+ `references/` only if
needed). Claude Code auto-discovers project skills here; no plugin.json needed.

**Runtime vs baked:** skills read `.second-brain.json` at runtime for live
structure (areas, link style, sourceHandling.mode); only wording + description
baked at generation.

**Generate step (extends v1.0.0):** after vault content (config → README → AGENTS
→ CLAUDE → templates → seed → .gitkeep), write each selected baseline skill and
each approved tailored skill under `.claude/skills/`. Never overwrite an existing
skill file without confirmation.

**Confirm gate (extended):** also lists the skills to be created (baseline +
tailored) with trigger phrase and output location. Still the single
last-reversible point.

**`.second-brain.json` additions:**
- `skills`: array of `{ name, kind: "baseline" | "tailored", description }`.
- `usageProfile`: the usage-thread answers (what they do regularly, what the AI
  should do) — for assistant context and future regeneration.

**Contract + hand-off:** the MANAGED block of `AGENTS.md` gains an "Available
skills" section listing generated skills. Hand-off tells the user the skills are
live and how to invoke them.

## Plugin repo changes

| File | Change |
|---|---|
| `references/workflow-interview.md` | New. Usage-thread questions + mapping to baseline confirmation and tailored candidates. |
| `references/skill-library/` | New dir. Five canonical skill templates (vault-doctor, update-index, ingest-inbox, weekly-review, recall). |
| `references/skill-generation.md` | New. Parameterizing baseline templates; fixed-shape pattern + guardrails for tailored skills. |
| `references/vault-structure.md` | Update. Add `.claude/skills/` to the tree; add `skills` + `usageProfile` to the schema. |
| `references/contract-template.md` | Update. Add "Available skills" section to the MANAGED block + placeholder. |
| `references/interview-script.md` | Update. Structure-thread enhancements + hand-off to workflow-interview.md. |
| `SKILL.md` | Update. Usage thread in interview; skill generation in confirm + generate steps; hand-off mention; version bump. |
| `README.md` | Update. Document the generated-skills capability. |
| `.claude-plugin/plugin.json` + `marketplace.json` | Update. Bump to 1.1.0; descriptions mention stood-up skills. |

## Versioning

**1.1.0** — additive, backward-compatible. Existing vaults remain valid; new
vaults gain `.claude/skills/`.

## Validation

Because the feature generates executable skills, the implementation ends with a
DRY-RUN: run the setup against a temp directory and assert that
`<vault>/.claude/skills/<name>/SKILL.md` files exist, each with valid YAML
frontmatter (name + description) and no unresolved `{{placeholders}}`. This
exercises generation, not just the templates.

## Phasing (for the implementation plan)

1. Schema + contract updates (vault-structure.md, contract-template.md).
2. The five baseline skill templates (skill-library/).
3. skill-generation.md + workflow-interview.md.
4. SKILL.md wiring + interview-script.md + manifests + README.
5. Consistency sweep + dry-run validation.

## Open follow-ups (out of scope)

- A "regenerate / add a skill later" command for existing vaults.
- Obsidian-native helpers (templater templates, recommended community plugins).
- A baseline capture/new-page skill if users later want AI-side capture.
