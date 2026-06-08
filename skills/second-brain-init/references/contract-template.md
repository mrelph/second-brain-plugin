# Contract template

This file defines what `AGENTS.md` and `CLAUDE.md` look like when the skill generates them, how their three blocks are owned, and how `.second-brain.json` values are substituted into each placeholder at generation time.

## The canonical `AGENTS.md` skeleton

Generate this file verbatim, substituting placeholders as described in [Placeholder substitution](#placeholder-substitution) below.

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

## Available skills
This vault ships with Claude Code skills in `.claude/skills/`. Use them when relevant:
{{skillsList}}

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

## `CLAUDE.md`

`AGENTS.md` is the canonical instruction file. `CLAUDE.md` simply imports it:

```markdown
@AGENTS.md
```

If `defaultAgent` is **not** `claude-code`, flip the roles: write the full contract to whatever filename the target agent expects as its instruction file, and place the single-line import in the other file. For example, if the agent reads `AGENTS.md` natively, `AGENTS.md` is canonical and `CLAUDE.md` does the importing — which is the default layout above. If the agent instead reads a different file (e.g. `.cursorrules`), write the three-block skeleton there and put the import reference in `AGENTS.md`.

## Block ownership model

The skeleton has three comment-delimited sections. Each has a distinct owner:

| Block | Owner | Rule |
|---|---|---|
| `<!-- BEGIN MANAGED … END MANAGED -->` | Machine (the skill) | Written once at setup. The comment markers are the anchor points a regenerator uses to replace only this block — it rewrites everything between them without touching anything outside. |
| `<!-- BEGIN PROJECT CUSTOMIZATIONS … END PROJECT CUSTOMIZATIONS -->` | User | The user's own additions, preferences, and overrides. Never overwritten by a regenerator. |
| `<!-- BEGIN ASSISTANT OBSERVATIONS … END ASSISTANT OBSERVATIONS -->` | Assistant | The assistant's cross-session working memory: patterns noticed, decisions made, lessons learned. Appended over time, never overwritten by a regenerator. |

This design means the file is **regenerate-capable without being auto-upgraded**. The MANAGED block is written once at `second-brain init` time. There is no CLI command that upgrades or rewrites it automatically later — if you want to update the MANAGED block, run the setup skill again (or edit by hand). The user's customizations and the assistant's observations survive any regeneration because they sit outside the MANAGED block's boundaries.

## Placeholder substitution

At generation time, substitute each `{{placeholder}}` using the values already collected in `.second-brain.json`:

| Placeholder | Source field | Notes |
|---|---|---|
| `{{projectName}}` | `projectName` | Appears in the `# Heading`. |
| `{{domain, in the user's words}}` | `schema.domain` | A full sentence describing what the KB is about. |
| `{{pageNaming}}` | `wiki.pageNaming` | One of `title-case`, `kebab-case`, or `sentence-case`. |
| `{{styleGuide}}` | `schema.styleGuide` | The user's concise writing rules for the assistant. If `schema.styleGuide` is absent, fall back to: `Concise and concrete. Cite or link sources. Mark synthesis vs. sourced facts.` (never leave the section empty or emit a literal placeholder). |
| `{{skillsList}}` | `skills` | A markdown bullet per generated skill: `- **<name>** — <description>`. If `skills` is empty/absent, write `- (none generated — run setup again to add skills)`. |

Conditional substitutions:

- **`{{if archive-after-ingest}} … {{else}} … {{endif}}`** — evaluate `sourceHandling.mode`. If the value is `archive-after-ingest`, emit the first branch; if `leave-in-inbox`, emit the second branch. Emit only the resolved text, not the `{{if}}` / `{{else}}` / `{{endif}}` tokens.
- **`{{wikilinks → [[Page]] | markdown → [Page](page.md)}}`** — evaluate `wiki.linkStyle`. If `wikilinks`, emit `wikilinks → [[Page]]`; if `markdown`, emit `markdown → [Page](page.md)`.
- **`{{on → include YAML frontmatter | off → omit it}}`** — evaluate `wiki.frontmatter`. If `true`, emit `on → include YAML frontmatter`; if `false`, emit `off → omit it`.
