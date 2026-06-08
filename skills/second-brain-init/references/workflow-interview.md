# Workflow interview

This is the usage thread of the setup interview. Run it **after** the structure thread (see `interview-script.md`) — the vault shape is already decided. The purpose here is to understand *how the user intends to use the vault* so that: (a) the right baseline skills are highlighted, and (b) a short list of tailored-skill candidates can be surfaced at the confirm gate.

Baseline skills are always generated regardless of what this thread reveals. The usage thread only adds context and candidates — it never suppresses anything.

---

## Fast path

Before asking anything, offer to skip:

> "Want to skip the usage questions? I'll generate the five standard skills (vault-doctor, update-index, ingest-inbox, weekly-review, recall) and leave the usageProfile empty. You can always add tailored skills later."

If the user accepts: generate baseline skills only, set no `usageProfile` in `.second-brain.json`, and move straight to the confirm gate. Do not prompt further.

---

## Questions

Batch all three in one message. They are free-text — not choice cards.

| # | Question | Drives |
|---|---|---|
| 1 | "What will you do with this vault regularly?" | `usageProfile.regularActivities` |
| 2 | "What do you want the AI to do for you?" | `usageProfile.aiResponsibilities` + which baseline skills to highlight |
| 3 | "Any recurring process you'd want a one-word command for?" | tailored-skill candidates |

Ask all three together:

> "Three quick questions about how you'll use the vault:
>
> 1. What will you do with it regularly? (e.g. log meeting notes, track projects, research topics)
> 2. What do you want me to do for you? (e.g. summarise sources, surface related notes, draft weekly reviews)
> 3. Is there a recurring process you'd want to run with a single command? (e.g. 'prep for client calls', 'draft a weekly summary', 'find everything on a topic')
>
> Skip any you're not sure about."

---

## Mapping answers to skills

### Baseline bundles (always generated)

All three bundles are always written to `.claude/skills/` regardless of what the user says. Do not omit or defer them.

| Bundle | Skills |
|---|---|
| Vault maintenance | `vault-doctor`, `update-index` |
| Inbox ingestion | `ingest-inbox` |
| Review & recall | `weekly-review`, `recall` |

**Highlighting guidance** — use the answers to Q1 and Q2 to determine which skills to call out at the confirm gate. Do not suppress any skill; just lead with the ones most relevant to what the user described.

- User mentions capturing notes, sources, or clippings → lead with `ingest-inbox`.
- User mentions reviewing, summarising, or staying on top of things → lead with `weekly-review`.
- User mentions finding or retrieving past work → lead with `recall`.
- User mentions vault health or keeping things tidy → lead with `vault-doctor` and `update-index`.

If the user's answer touches multiple bundles, mention all of them — just order by relevance.

### Tailored-skill candidates

For each recurring process named in Q3 — or clearly implied by Q1/Q2 — that has a distinct, repeatable output, draft a tailored-skill candidate per `skill-generation.md`.

**Rules (from `skill-generation.md`):**

- Only propose a tailored skill for a **recurring** process with a **distinct output**. Vague intentions and one-off tasks do not qualify.
- When uncertain, do not propose. Tell the user: "I wasn't sure this warranted its own skill — you can ask for it later."
- Cap at **3 candidates** unless the user explicitly asks for more.
- Every candidate is shown at the confirm gate (name + trigger phrase + one-line behaviour + output location) for individual approval before any file is written.

**Worked example — mapping user wording to vault structure:**

User says: "prep for client calls"

Candidate:
- **name:** `prep-client-call`
- **trigger phrase:** "prep for my call with [person]"
- **behaviour:** reads `06 - People/<person>.md` + recent entries in `03 - Meeting Notes/` mentioning that person, then drafts a one-page brief covering: open threads, last discussion points, and any relevant wiki links.
- **output:** a temporary draft in `04 - Projects/` or a new `03 - Meeting Notes/<date> - <person> prep.md`, whichever the user prefers.

This demonstrates the key step: map the user's informal phrase to the vault's real activity areas (e.g. `06 - People/`, `03 - Meeting Notes/`) by reading `.second-brain.json` at skill runtime.

Other common mappings as guidance:

| User phrase | Likely vault areas touched | Typical output |
|---|---|---|
| "draft a weekly summary" | `03 - Meeting Notes/`, `04 - Projects/`, `sources/inbox/` | `01 - Steering/<date> - Weekly Review.md` |
| "find everything on a topic" | `wiki/`, all activity areas | inline summary with links |
| "summarise a paper" | `sources/inbox/` | new page in `02 - Research/` or `wiki/concepts/` |
| "track action items" | `03 - Meeting Notes/`, `04 - Projects/` | updated project file or dedicated action-items note |

---

## Output

After the user answers (or skips), produce two things — but **do not write any files yet**:

**1. The `usageProfile` object** to be merged into `.second-brain.json`:

```json
"usageProfile": {
  "regularActivities": ["<derived from Q1>"],
  "aiResponsibilities": ["<derived from Q2>"],
  "tailoredSkills": []
}
```

`tailoredSkills` starts empty; it is populated after the user approves candidates at the confirm gate. On the fast path, omit `usageProfile` entirely.

**2. The tailored-skill candidate list** — one entry per candidate, in this format:

> **`<name>`** — trigger: "<trigger phrase>" — <one-line behaviour> — output: <location>

Present this list at the confirm gate alongside the `usageProfile` draft. The user approves, edits, or drops each candidate individually. Only after approval does generation proceed (per `skill-generation.md`).

---

## Tone

Conversational, not survey-like. If the user gives a vague answer to Q3 (e.g. "not sure"), accept it and move on — do not push for a skill candidate when none was volunteered. End with the confirm gate: show the `usageProfile` and any candidates, invite edits, then wait for a clear go-ahead.
