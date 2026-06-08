# Interview script

Use when no existing material is available — the user is starting fresh. Before asking anything, **offer the fast path**. Then batch the conversational questions 2-3 per message; never ask one at a time.

---

## Fast path (offer first)

Before starting the interview, offer to skip the questions:

> "Want to skip the setup questions and use sensible defaults? I'll just need a project name and a one-line description, then generate everything automatically."

If the user accepts: collect only `projectName` and `schema.domain`, apply all silent defaults from the table below, then jump straight to the confirm gate. The fast path is **offered, not the default** — always give the user a chance to customize.

---

## Conversational questions (free-text, batch 2-3 per message)

These are asked as natural conversation, not structured choice cards.

| # | Question | Maps to | Notes |
|---|---|---|---|
| 1 | "What should we call this knowledge base?" | `projectName` | Short, human-readable. Default to the target directory name if obvious. |
| 2 | "In one line, what is this knowledge base about?" | `schema.domain` | Push once for specifics. "Research" is bad; "AI alignment papers and the arguments they make" is good. |
| 3 | "What kinds of things will pages usually be about? (e.g. papers, authors, methods — or skip if you're not sure)" | `schema.entityTypes` | Comma-separated. 3-6 items typical. Optional — if the user shrugs, skip. |
| 4 | "What's a question you'd want this to answer well?" | `schema.commonQueries` | One or two examples is plenty. Use [placeholder] syntax in examples, e.g. "What has [author] said about [concept]?". Optional. |
| 5 | "Any notes on writing style or how pages should read? (e.g. 'terse bullet points', 'narrative prose', 'formal citations')" | `schema.styleGuide` | Optional. If the user skips, set the default: `"Concise and concrete. Cite or link sources. Mark synthesis vs. sourced facts."` |
| 6 | "When you capture something — say, a meeting note or a reference — where should it live, and does it become a permanent `wiki/` page or stay in an activity area?" | routing intent | Elicits the inbox → area → wiki routing that the maintenance/ingest skills rely on. Optional — accept a rough answer. |

Batch questions 1-2 in the first message, then 3-6 together (or split if the conversation warrants it).

---

## Structured-card decisions (AskUserQuestion tool)

These are presented as **structured choice cards** via the AskUserQuestion tool — only for decisions with real trade-offs. Do not present them as free-text questions.

### 1. Link style
> "Which link format will you use?"
- **Wikilinks** — Obsidian `[[Page]]` style. Best if you use Obsidian or a wikilink-aware editor.
- **Markdown links** — Portable `[Page](page.md)` style. Works in any editor or on GitHub.

Maps to `wiki.linkStyle`. Default: `wikilinks`.

> **Note:** If the user picks Obsidian / wikilinks, `wiki.frontmatter` and `wiki.pageNaming` are almost certainly fine as the defaults (`true` / `title-case`). Only surface those sub-options if the user raises them.

### 2. Activity areas
> "Here are the default activity areas. Confirm, or tell me which to add, remove, or rename:"
>
> 1. 01 - Steering
> 2. 02 - Research
> 3. 03 - Meeting Notes
> 4. 04 - Projects
> 5. 05 - Big Ideas
> 6. 06 - People
>
> (These become the top-level numbered folders in your vault.)

Maps to `categories.activityAreas`. Default: the six above.

### 3. Source handling
> "When a source file (PDF, note, clip) is ingested from your inbox, what should happen to it?"
- **Archive after ingest** — Move processed sources from `inbox/` to `archive/`. Keeps your inbox clear.
- **Leave in inbox** — Keep all sources in `inbox/` after ingesting. Useful if you manage files manually.

Maps to `sourceHandling.mode`. Default: `archive-after-ingest`.

### 4. Frontmatter + page naming (only if not already implied)
Surface these only if the user's link-style choice leaves them ambiguous (e.g. they chose markdown links and didn't mention an editor):

- **Frontmatter:** include YAML frontmatter on each page? (default `true`)
- **Page naming:** title-case, kebab-case, or sentence-case? (default `title-case`)

Maps to `wiki.frontmatter` and `wiki.pageNaming`.

---

## Defaults to use silently

Do not ask about these unless the user volunteers a preference:

| Field | Silent default |
|---|---|
| `defaultAgent` | `"claude-code"` |
| `formatVersion` | `1` |
| `wiki.frontmatter` | `true` |
| `wiki.pageNaming` | `"title-case"` |
| `categories.activityAreas` | `["01 - Steering","02 - Research","03 - Meeting Notes","04 - Projects","05 - Big Ideas","06 - People"]` |
| `categories.wikiCategories` | `["entities","concepts","topics"]` |
| `sourceHandling.mode` | `"archive-after-ingest"` |
| Git init | `true` (init a repo in the vault directory) |

---

## Tone

Brief and conversational, not survey-like. After 2-3 questions, summarize what has been captured before continuing. If the user gives a vague answer, push **once** for specificity ("Can you give me an example?") then accept what they say. End every segment with the confirm gate — show the config, invite edits.

---

## Example interaction

> **Skill:** Before we dive in — want to skip the setup questions and use sensible defaults? I'd just need a project name and a one-line description, and I'll handle the rest automatically.
>
> **User:** No, I'd like to customize it a bit.
>
> **Skill:** Great. Let's start:
>
> 1. What should we call this knowledge base?
> 2. In one line, what's it about?
>
> **User:** Call it "AI Alignment Research". It's a place to track papers, authors, and the arguments they make.
>
> **Skill:** Nice. "Research" is a bit broad — to make sure the assistant structures pages well, can you be more specific? For example: "AI alignment papers, the authors who write them, and the arguments they advance."
>
> **User:** Yeah, that's basically it.
>
> **Skill:** Got it. Three more optional ones — skip any you're not sure about yet:
>
> 3. What kinds of things will pages usually be about? (e.g. papers, authors, methods)
> 4. What's a question you'd want this to answer well? Use [placeholder] syntax if helpful.
> 5. Any notes on writing style?
>
> **User:** Pages will be about papers, authors, and concepts. "What has [author] said about [concept]?" is a good example query. Keep it terse — bullet points, not prose.
>
> **Skill:** [AskUserQuestion — link style card]
> Which link format will you use?
> - Wikilinks (Obsidian `[[Page]]`)
> - Markdown links (portable `[Page](page.md)`)
>
> **User:** Wikilinks — I use Obsidian.
>
> **Skill:** [AskUserQuestion — activity areas card]
> Here are the default activity areas. Confirm, or tell me what to change:
> 1. 01 - Steering, 2. 02 - Research, 3. 03 - Meeting Notes, 4. 04 - Projects, 5. 05 - Big Ideas, 6. 06 - People
>
> **User:** Those look fine.
>
> **Skill:** [AskUserQuestion — source handling card]
> When a source is ingested from your inbox, should I archive it or leave it in place?
> - Archive after ingest
> - Leave in inbox
>
> **User:** Archive it.
>
> **Skill:** Here's the config I'd write — confirm or tell me what to change:
>
> ```json
> {
>   "projectName": "AI Alignment Research",
>   "defaultAgent": "claude-code",
>   "formatVersion": 1,
>   "schema": {
>     "domain": "AI alignment papers, the authors who write them, and the arguments they advance",
>     "entityTypes": ["papers", "authors", "concepts"],
>     "commonQueries": ["What has [author] said about [concept]?"],
>     "styleGuide": "Terse bullet points, not prose."
>   },
>   "categories": {
>     "activityAreas": [
>       "01 - Steering",
>       "02 - Research",
>       "03 - Meeting Notes",
>       "04 - Projects",
>       "05 - Big Ideas",
>       "06 - People"
>     ],
>     "wikiCategories": ["entities", "concepts", "topics"]
>   },
>   "wiki": {
>     "linkStyle": "wikilinks",
>     "frontmatter": true,
>     "pageNaming": "title-case"
>   },
>   "sourceHandling": {
>     "mode": "archive-after-ingest"
>   }
> }
> ```
>
> Happy with this, or anything to adjust?

---

After the structure thread, run the **usage thread** in `references/workflow-interview.md` to map how the user will use the vault and which skills to stand up.
