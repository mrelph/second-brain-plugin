# second-brain (Claude Code plugin)

A self-contained Claude Code plugin that designs and generates a personal knowledge-base vault from a single conversation — no external tools required.

## What this plugin is

When activated, the bundled `second-brain-init` skill conducts a brief interview (or ingests an existing folder of notes), drafts a vault design, then **generates the entire vault directly** using the Write tool: folder structure, README, assistant contract, page templates, and domain-flavored seed pages.

As part of setup, the skill also runs a short **workflow-mapping interview** — a few targeted questions about how you actually plan to use the vault day-to-day (capture habits, review cadence, how you process sources, etc.). Based on your answers it generates a set of **Claude Code skills written directly into `<vault>/.claude/skills/`**. These skills handle the ongoing work of maintaining the vault: ingesting inbox items, running weekly reviews, answering recall questions, and more.

There is nothing to install separately. The skill is the scaffolder. Claude Code is the only runtime needed.

## Installation

This repo is its own single-plugin marketplace. Install with two slash commands inside any Claude Code session:

```
/plugin marketplace add mrelph/second-brain-plugin
/plugin install second-brain@second-brain-marketplace
```

Restart the session (or `/plugin reload`) to activate. Verify with `/plugin list` — `second-brain` should appear and the `second-brain-init` skill should fire on phrases like "set up a second-brain for X".

### Local development

```sh
# Clone, then point the marketplace add at the local path
git clone https://github.com/mrelph/second-brain-plugin.git
# In Claude Code:
#   /plugin marketplace add ./second-brain-plugin
#   /plugin install second-brain@second-brain-marketplace
```

## Usage

In any Claude Code session, just describe what you want:

> "Set up a second-brain in `~/notes/research` for AI alignment papers."
>
> "I want a knowledge base for my recipes."
>
> "Build me a personal wiki for journal entries."

The skill activates and runs an **adaptive walkthrough** — a 2-3 message interview that surfaces domain, folder preferences, entity types, and linking style. Once the design is ready it shows you a summary and asks for confirmation before writing anything.

After the vault design is confirmed, a second short interview maps your workflow habits (how you capture, process, and review material). This drives the generation of vault-specific skills in `.claude/skills/`. After generation, the `AGENTS.md` / `CLAUDE.md` pair that was written into the vault governs all ongoing maintenance, and the skills handle day-to-day vault work.

**Ingest mode** — if you point at an existing folder of notes (no `.second-brain.json` yet), the skill switches to ingest mode:

> "Set up a second-brain for the notes in `~/journal` — they're already there."

It reads representative files, infers domain / entity types / link style from what's there, presents a draft design for you to confirm or tweak, then generates the vault structure around your existing content.

## Vault structure

Every generated vault follows this canonical layout:

```
<vault>/
├── .second-brain.json        # design record
├── README.md                 # what this is, the folder taxonomy, how to use it
├── AGENTS.md                 # the assistant contract (canonical, 3-block)
├── CLAUDE.md                 # imports @AGENTS.md so Claude Code picks it up
├── .claude/
│   └── skills/               # generated vault skills (see below)
│       ├── vault-doctor/
│       ├── update-index/
│       ├── ingest-inbox/
│       ├── weekly-review/
│       └── recall/
├── 01 - Steering/            # guiding docs — vision, principles, scope
├── 02 - Research/
├── 03 - Meeting Notes/
├── 04 - Projects/
├── 05 - Big Ideas/
├── 06 - People/
├── wiki/                     # distilled, interlinked permanent notes
│   ├── entities/
│   ├── concepts/
│   └── topics/
├── sources/
│   ├── inbox/                # drop raw material here
│   └── archive/              # processed material
└── templates/                # page templates the assistant copies
```

### Hybrid taxonomy

The vault uses a **hybrid taxonomy** that separates active work from distilled knowledge:

- **Numbered areas (01–06):** working material — steering docs, research in progress, meeting notes, project files, big ideas, and people profiles. These are activity-oriented and change frequently.
- **`wiki/`:** distilled, interlinked permanent notes — the knowledge graph. Pages here are stable, cross-linked summaries that survive the activity they were born from. Organised by entities, concepts, and topics.

The split keeps day-to-day work from cluttering the permanent knowledge store, while making it easy to "graduate" a research note or meeting outcome into the wiki once it's settled.

### The 3-block assistant contract

`AGENTS.md` (imported by `CLAUDE.md`) contains three blocks that govern how the AI maintains the vault:

1. **Managed** — non-negotiable rules the assistant always follows (naming conventions, link style, vault root boundary).
2. **Project Customizations** — domain-specific rules generated during the interview (entity types, tagging taxonomy, source handling).
3. **Assistant Observations** — a running scratchpad where the assistant records patterns, open questions, and maintenance notes as it works.

This contract is the source of truth for vault maintenance. It lives in the vault, travels with it, and can be edited directly.

## Skills your vault ships with

Every generated vault includes five baseline skills in `.claude/skills/`. Open the vault folder in Claude Code and invoke them by simply asking — for example, "ingest my inbox" or "run a weekly review." The skills read and write files via Claude Code; they do not run inside Obsidian or any other app.

| Skill | What it does |
|---|---|
| **vault-doctor** | Find broken/orphaned links, inconsistent frontmatter, and empty stubs; offer targeted fixes. |
| **update-index** | Maintain Map-of-Content and index pages for each area and wiki category, keeping navigation current. |
| **ingest-inbox** | Process items in `sources/inbox/`: file each one into the right area, distil key ideas into linked wiki pages, then archive the source. |
| **weekly-review** | Summarise recent activity, surface stale items and open loops, and prompt a short reflection. |
| **recall** | Answer "what do we know about X?" with cited references drawn from across the vault. |

If the workflow interview reveals domain-specific habits (e.g. a particular capture or publication workflow), additional tailored skills may be generated alongside these five. All skills are plain files in `.claude/skills/` — you can read, edit, or extend them at any time.

## What it doesn't do

- **Run inside Obsidian.** The plugin operates entirely through Claude Code. The assistant maintains the vault via the generated skills and the `AGENTS.md` contract; no Obsidian plugin or external process is involved.
- **Maintain the wiki automatically.** Ongoing maintenance is driven by you invoking the vault skills (or asking the assistant directly). The skills and contract govern how that work is done.
- **Re-init an existing vault.** If `.second-brain.json` already exists in the target folder the skill stops rather than overwriting your work.
- **Ingest source material into pages during setup.** First content comes from your sources after the vault is live — use the `ingest-inbox` skill once material has been dropped into `sources/inbox/`.

## Architecture

```
┌──────────────────────────┐           ┌──────────────────────────┐
│  second-brain-init skill │           │  Generated vault          │
│  (interview / ingest /   │──writes──▶│  AGENTS.md governs        │
│   design / confirm gate) │           │  all future maintenance   │
└──────────────────────────┘           └──────────────────────────┘
         Claude Code                         Write tool only
```

The plugin owns the design conversation and the initial generation. No external process, no intermediate config layer — just Claude Code reading and writing files.

## License

MIT
