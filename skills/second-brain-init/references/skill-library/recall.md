---
name: recall
description: >
  Use when the user asks "what do we know about [X]?", "recall [topic]", "what
  have I written about [X]", or "summarize what's in the vault about [X]". Searches
  wiki/ and the activity areas, follows links, and synthesizes a cited answer with
  page references. Do NOT use to add or file content (use ingest-inbox).
version: 1.0.0
---

# recall

Searches the {{projectName}} vault — a {{domain}} knowledge base — and synthesizes a cited answer from what is actually written there, without adding or modifying any content.

## Before you start

Read `.second-brain.json` at the vault root before doing anything else. You need:

- `categories.wikiCategories` — the subfolders of `wiki/` to search first (e.g., `["entities", "concepts", "topics"]`).
- `categories.activityAreas` — the activity-area folder names, searched after `wiki/`.
- `wiki.linkStyle` — `"wikilinks"` or `"markdown"`: tells you what link syntax to follow when traversing connections between pages.

Do not assume default folder names — always read the live config.

## How to answer

**1. Search `wiki/` first.**
Start with the wiki categories from `categories.wikiCategories`. These pages hold distilled, interlinked knowledge and are the most reliable source. Look for pages whose filenames or headings closely match the query topic.

**2. Search the activity areas.**
After exhausting wiki results, scan the activity-area folders from `categories.activityAreas` for meeting notes, project pages, research entries, and ideas that mention the topic.

**3. Follow links.**
From any page that matches the query, follow outbound links to gather related context. Use the configured link style to identify links: `[[Page]]` for wikilinks or `[text](path.md)` for markdown. Follow links one level deep unless the topic clearly spans multiple hops.

**4. Synthesize a concise answer.**
Write a direct answer to the user's question, drawing only on what the vault pages say. Organize by theme or chronology if multiple pages contribute.

**5. Cite every claim.**
After each piece of information, include the source page path in parentheses (e.g., `(wiki/concepts/attention.md)`). Do not state anything as fact without a citation to a vault page.

**6. Separate vault content from your own synthesis.**
Clearly distinguish between "the vault says X" and any connective tissue or framing you add. If you draw an inference the vault does not explicitly make, label it as such.

## When the vault is thin

If you find little or nothing on the topic:

- Say so explicitly: "The vault has limited information on [X]."
- List the closest pages found, even if they only tangentially relate.
- Suggest concrete next steps: "You could add a note to `sources/inbox/` about this, then run ingest-inbox to file it."
- Do not fabricate information or fill gaps from general knowledge without clearly labelling it as external context that is not in the vault.

## What this skill does NOT do

- Does not modify the vault in any way — no writes, no appends, no deletions.
- Does not invent facts or fill gaps with fabricated content.
- Does not ingest new material (use ingest-inbox for that).
