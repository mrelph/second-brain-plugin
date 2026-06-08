# Vault structure

The canonical layout the skill generates. This file is the **source of truth** for what a second-brain vault looks like and for the `.second-brain.json` schema. Generate exactly this structure unless the user customized the activity areas or wiki categories during the walkthrough.

## Folder layout

```
<vault>/
├── .second-brain.json
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── .claude/
│   └── skills/                # generated Claude Code skills (maintenance + usage + tailored)
│       ├── vault-doctor/
│       ├── update-index/
│       ├── ingest-inbox/
│       ├── weekly-review/
│       └── recall/            # (+ any workflow-tailored skills)
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

## Layout rules

- **Only the activity areas are numbered** (`01`–`06`). `wiki/`, `sources/`, and `templates/` stay unnumbered alongside them — they are machinery and a distilled-knowledge graph, not browsable activity areas.
- **The numbered areas are the default *example* set.** The walkthrough lets the user rename, add, or drop them, and customize which `wiki/` categories exist. Whatever the user lands on is recorded in `.second-brain.json` under `categories`.
- **`06 - People` vs `wiki/entities/`.** `06 - People` is a working directory of the people you interact with — a lightweight CRM (one file per person: role, context, interaction log). `wiki/entities/` holds *distilled, interlinked* entity pages that belong to the permanent knowledge graph. A person can have a working file in `06 - People/` and, once they matter enough to the knowledge, a distilled page in `wiki/entities/`. The contract and README explain this so the two never feel redundant.
- **The `.claude/skills/` folder holds executable Claude Code skills generated at setup.** Claude Code auto-discovers them when the vault folder is opened. Vault content stays Obsidian-compatible; the skills run in Claude Code, not inside Obsidian.
- **Empty folders get a `.gitkeep`.** Any folder that would otherwise be created empty (e.g. `wiki/concepts/`, `sources/archive/`) gets a `.gitkeep` so it exists on disk and survives git.

## `.second-brain.json` schema

A machine-readable record of the vault's design intent. **Nothing executes this file at runtime** — there is no CLI. It exists so the assistant can re-read the vault's design each session, and so a future regenerator has something to read. Write it with real values substituted for the descriptions below.

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
  },
  "skills": [
    { "name": "ingest-inbox", "kind": "baseline", "description": "Process sources/inbox into filed + distilled notes" }
  ],
  "usageProfile": {
    "regularActivities": ["short phrases: what the user does regularly"],
    "aiResponsibilities": ["what the user wants the AI to do"],
    "tailoredSkills": ["names of workflow-specific skills generated"]
  }
}
```

### Field notes

- `projectName` (required): appears in the README and contract headings.
- `defaultAgent`: `"claude-code"` in this skill context unless the user names a different assistant. Affects which instruction file is canonical (see `contract-template.md`).
- `formatVersion`: integer, currently `1`. Lets a future regenerator detect the format.
- `schema.domain`: a *sentence*, not a noun phrase. "AI alignment papers and the arguments they make" beats "AI alignment".
- `schema.entityTypes`: *types*, not instances ("authors", not "Stuart Russell").
- `schema.commonQueries`: use placeholder syntax (`[author]`, `[concept]`) so the assistant reads them as templates.
- `schema.styleGuide`: read by the assistant every session — keep it tight and concrete.
- `categories.activityAreas`: the numbered top-level folders, with their exact names (including the `NN - ` prefix).
- `categories.wikiCategories`: the subfolders of `wiki/`.
- `wiki.linkStyle`: `"wikilinks"` for Obsidian `[[Page]]`; `"markdown"` for portable `[Page](page.md)`.
- `sourceHandling.mode`: `"archive-after-ingest"` keeps `inbox/` clean (good for high volume); `"leave-in-inbox"` keeps sources visible (good for journal-style re-reading). These are the only two valid values.
- `skills`: a record of the Claude Code skills generated into `.claude/skills/`. `kind` is `baseline` (always generated) or `tailored` (derived from the usage interview).
- `usageProfile`: captured from the usage thread of the interview. Lets the assistant understand intended use and a future regenerator rebuild skills. Optional — omitted on the fast path.
