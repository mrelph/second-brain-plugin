# Second Brain Dashboard

A read-only web dashboard over a [second-brain](https://github.com/mrelph/second-brain)
markdown vault. It scans your vault, classifies each page, and surfaces:

- **Projects** — status board (active / blocked / paused / done) with next steps
- **People** — relationship strength and last contact, with stale-contact flags
- **Orgs** — organizations and recent touchpoints
- **Commitments** — owner / due / status / source, with overdue highlighting
- **Activities** — a reverse-chronological timeline
- **Themes** — recurring themes ranked by what links to them
- **Research** — notes, papers, and sources

It is **read-only** — it never writes to your vault.

## Quick start

```sh
cd dashboard
npm install
npm run dev          # http://localhost:3000 — uses the bundled sample vault
```

Point it at your own vault by setting `VAULT_PATH` (the folder containing
`.second-brain.json`):

```sh
cp .env.example .env
# edit .env: VAULT_PATH=/absolute/path/to/your/vault
npm run dev
# or inline:
VAULT_PATH=/path/to/vault npm run dev
```

Production build:

```sh
npm run build && npm start
```

## How it classifies your vault

Every markdown page is sorted into one of 7 roles (project, person, org,
commitment, activity, theme, research) — or a generic `note` if nothing matches.
The classifier is **tolerant**: a page with no frontmatter is still classified by
its folder, filename, or body, and every field falls back gracefully (down to the
file's modified time for dates).

Recommended (but optional) frontmatter per role:

| Role | Useful frontmatter |
| --- | --- |
| project | `type, status, updated, next, owner, links` |
| person | `type, org, relationship, last_contact, role` |
| org | `type, domain, last_touchpoint, status` |
| commitment | `type, owner, due, status, source` |
| activity | `type, date, kind, participants` |
| theme | `type, status` |
| research | `type, source_url, authors, date, status` |

## Adapting to your vault

If your vault uses different folder names, `type:` values, or status words, edit
**`vault.config.ts`** — your overrides are merged with the built-in defaults. Open
**`/debug`** in the running app to see exactly how each page was classified and
which of your `.second-brain.json` entityTypes didn't map to a role.

## Tests

```sh
npm test         # vitest, runs against sample-vault/ (hermetic)
npm run typecheck
npm run lint
```
