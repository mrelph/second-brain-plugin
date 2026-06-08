---
name: weekly-review
description: >
  Use when the user asks for a "weekly review", "what happened this week",
  "review my vault", or "what's stale / what are my open loops". Summarizes recent
  activity across activity areas, surfaces stale items and unchecked action items,
  and prompts reflection. Do NOT use to ingest new material (use ingest-inbox).
version: 1.0.0
---

# weekly-review

Produces a structured weekly review for the {{projectName}} vault: recent activity, open loops, stale items, and reflection prompts — all derived from what is actually in the vault.

## Before you start

Read `.second-brain.json` at the vault root before doing anything else. You need:

- `categories.activityAreas` — the exact folder names of all activity areas, so you scan the right paths.
- `wiki.frontmatter` — if `true`, pages carry YAML frontmatter (possibly including a `date`, `created`, or `modified` field) that can be used to identify when a page was created or last meaningfully updated. Use these fields for temporal windowing when available; fall back to filesystem modification timestamps when not.

Do not assume default folder names — always read the live config.

## What it produces

### 1. Recent activity

List pages created or meaningfully modified within the review window. Default window: the last 7 days. If the user wants a different window (e.g., last 14 days, this calendar week), ask before scanning.

Group results by activity area using the names from `categories.activityAreas`. Within each group, list page names with dates. Do not include `_index.md`, `_example-*`, or `.gitkeep` entries.

### 2. Open loops

Scan the activity areas most likely to contain action items — typically the meeting-notes area and the projects area, or whatever the user has named them in `categories.activityAreas`. Look for unchecked Markdown task items (`- [ ]`). List each one with its source page path so the user can navigate directly to it.

If the user's area names differ from the defaults, use the names from `categories.activityAreas` to identify the right folders — do not hardcode folder names.

### 3. Stale items

Flag pages that:
- Were modified more than 30 days ago and contain unchecked action items, OR
- Are in an activity area (not `wiki/`) and have not been touched in more than 60 days and appear unfinished (contain `TODO`, `TBD`, or an empty section).

List with paths and approximate age. These are candidates for either completing, archiving, or discarding — but this skill does not take any of those actions.

### 4. Reflection prompts

Offer 3–5 open-ended questions to close the review, tailored to what surfaced above. Examples:

- "What did you learn this week that should become a permanent wiki page?"
- "Which open loop is most important to close next?"
- "Is there anything in your inbox that has been sitting there too long?"

## Output

Ask the user whether to:

- **Write the review as a dated note** into the steering area (the first area in `categories.activityAreas`, typically `01 - Steering/` or whatever it is named). Filename: `YYYY-MM-DD-weekly-review.md`.
- **Present it in chat only**, without writing any files.

Wait for the answer before writing anything.

## What this skill does NOT do

- Does not modify content pages or check off action items.
- Does not ingest new material from `sources/inbox/` (use ingest-inbox for that).
- Does not delete stale pages — it only surfaces them for the user's attention.
