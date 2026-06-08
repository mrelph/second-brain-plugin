# Skill generation

This reference governs how the setup writes skills into `<vault>/.claude/skills/`. Read it before generating any skill file.

## Generating the baseline skills

The five baseline skills live in `references/skill-library/`: `vault-doctor`, `update-index`, `ingest-inbox`, `weekly-review`, and `recall`. They are grouped into three bundles:

| Bundle | Skills |
|---|---|
| Vault maintenance | `vault-doctor`, `update-index` |
| Inbox ingestion | `ingest-inbox` |
| Review & recall | `weekly-review`, `recall` |

**All three bundles are always generated.** There is no conditional omission — every vault gets all five baseline skills regardless of what the usage interview reveals.

For each skill:

1. Copy the template from `references/skill-library/<name>.md`.
2. Write the result to `<vault>/.claude/skills/<name>/SKILL.md`.
3. Substitute **only** `{{projectName}}` and `{{domain}}` using the values from `.second-brain.json`. All other structure — activity areas, wiki categories, link style, source-handling mode — is read by the skill at runtime from `.second-brain.json`. Do NOT bake those values in at generation time.
4. After writing, verify that **no unresolved `{{placeholders}}`** remain in the output file. If any are found, resolve them before continuing.

## Generating tailored skills

Tailored skills come from the usage thread of the interview (see `workflow-interview.md`). They capture recurring processes that the user described — things they do often enough to warrant a repeatable skill.

Author each tailored skill to this fixed shape:

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

Write each tailored skill to `<vault>/.claude/skills/<name>/SKILL.md` alongside the baseline skills. Use real values — not `{{placeholders}}` — because tailored skills are bespoke to this vault and have no template to substitute into at runtime.

## Guardrails

- **Only generate a tailored skill for a RECURRING process with a DISTINCT output.** A one-off task or a vague intention does not qualify.
- **When uncertain, do NOT generate.** Tell the user: "I wasn't sure this warranted its own skill — you can ask for it later." Err toward fewer skills.
- **Show every candidate at the confirm gate.** Present each proposed tailored skill as: name + trigger phrase + one-line behavior + output location. The user approves, edits, or drops each one individually before any file is written.
- **Cap: propose at most 3 tailored skills per setup** unless the user explicitly asks for more.

## Recording

Every generated skill — baseline and tailored — is recorded in `.second-brain.json` under `skills` as an object with three fields:

```json
{ "name": "skill-name", "kind": "baseline", "description": "one-line summary" }
```

`kind` is `"baseline"` for the five standard skills and `"tailored"` for anything derived from the usage interview.

`usageProfile.tailoredSkills` lists the names of all tailored skills generated, in the order they were approved.

Update `.second-brain.json` after all skills have been written — do not write partial records.
