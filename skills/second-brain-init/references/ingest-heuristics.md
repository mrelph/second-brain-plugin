# Ingest heuristics

Use when the user pointed at a folder of existing material instead of starting fresh. The goal: read enough to draft a credible config, then **show the draft and let the user correct it**. Never silently bake assumptions.

## Overwrite safety — read this first

Ingest mode creates the vault scaffold **around** existing files. It **never overwrites or moves existing files**. When the inferred structure suggests that a file belongs in a particular activity area or wiki sub-folder, that is presented as a *suggestion* in the confirmation step — the user decides whether and how to file things. Do not perform any file moves or deletions during ingest.

## What to read

- List the folder. If >50 files, sample. Prefer recently-modified.
- Read 5-15 representative files end-to-end. Skip if >10k tokens; sample beginning + headings instead.
- Prioritize `.md`, `.txt`, `.org`, `.rst`. Skip binaries, images, and code source unless the folder is clearly a code-notes situation.
- If a `README.md` or `index.md` exists, read it first — it usually states the folder's purpose.

## What to infer

### `projectName`

- Default to the folder's basename, title-cased.
- If the README has a clear `# Heading`, use that instead.

### `schema.domain`

- Synthesize from file content, README, and folder structure. Aim for one specific sentence.
- Bias toward what the *content* is about, not what the *folder* is named.
- If the folder has clear topical clusters, mention them ("a journal of X and Y").

### `schema.entityTypes` and `categories.wikiCategories`

These two fields are inferred together from the same signals — entity types shape what goes into the wiki and which wiki sub-categories make sense.

- Look at recurring nouns at the *type* level (not specific entities). If most pages are about a person, "people" or "authors" is an entity type, not the specific person's name.
- Look at folder substructure: subfolders often map to entity types (`people/`, `projects/`, `books/`). Each such type is a candidate entry for both `schema.entityTypes` *and* `categories.wikiCategories` (e.g. `entities`, `concepts`, `topics` are the defaults; add or replace based on what's actually present).
- Look at YAML frontmatter `type:` or `category:` fields if present.
- 3-6 items for each. If unclear, use the standard wiki categories (`entities`, `concepts`, `topics`) and leave `schema.entityTypes` empty rather than guessing.

### `schema.commonQueries`

- Hard to infer. Either skip (empty array is fine) or ask the user one targeted question after showing the rest of the draft: "What's a question you'd want this to answer well? I'll add it to the config."

### `wiki.linkStyle`

- If existing files use `[[Page Name]]` syntax → `wikilinks`.
- If existing files use `[Page](page.md)` → `markdown`.
- If neither (e.g. all standalone notes) → `wikilinks` default. Ask if uncertain.

### `wiki.frontmatter`

- If existing files have YAML frontmatter (`---\nfield: value\n---`) → `true`.
- Otherwise → `false`. The contract should match what the user already does.

### `categories.activityAreas`

The vault uses six numbered activity areas (`01 - Steering` through `06 - People`). Default to proposing all six, then trim or rename based on what's actually present:

- **Detect which areas are relevant** by examining folder names and content. Examples:
  - A `meetings/` subfolder or files with dated meeting-style headings → keep `03 - Meeting Notes`.
  - A `projects/` subfolder or project-tracking files → keep `04 - Projects`.
  - No personal/journal content → consider noting `02 - Personal` as currently-unused rather than removing it (it can be useful later).
- **Flag currently-unused areas** in the confirmation step (e.g. "I'm including `04 - Projects` as a default — mark it unused if you don't need it yet"). This lets the user remove or rename areas before the scaffold is created.
- If a subfolder name clearly maps to a non-standard label (e.g. `clients/` → `06 - Clients` instead of `06 - People`), propose the rename in the confirmation.

## Things NOT to infer

- `defaultAgent` — always `"claude-code"` in this skill context.
- `sourceHandling.mode` — default to `"archive-after-ingest"` (moves source files to the archive after processing). Set `"leave-in-inbox"` if the user prefers to keep everything visible in the inbox. These are the only two valid values.
- `wiki.pageNaming` — usually obvious from existing files; if pages are `like-this.md` use `kebab-case`, if `Like This.md` use `title-case`. Default to `title-case`.

## Conflict resolution

If existing material disagrees with itself (some files have frontmatter, some don't; mix of link styles), pick the **majority pattern** and note the disagreement to the user in the confirmation step. The user might have a preference for what the new contract should enforce going forward.

## Output

After inferring, present:

1. The drafted JSON config in a code block.
2. A short list of "things I noticed" — particularly anything inferred (entity types, link style) that the user might want to adjust.
3. An ask: "Confirm, or tell me what to change."

Then wait for the user's response before creating any files or folders.
