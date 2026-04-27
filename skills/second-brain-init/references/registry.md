# Vault registry

A per-machine list of second-brain vaults the user has created or registered. Lives at `~/.second-brain/vaults.json`. Maintained by the `second-brain` CLI (v0.3.0+) — read it via the CLI, not by parsing the file directly.

## Why it exists

After a vault is created, finding it later is Claude Code's default `CLAUDE.md` / `AGENTS.md` reading mechanism (works automatically once you `cd` into the vault). The registry solves a different problem: when the user is **not** in a vault directory but wants to work with one, and Claude needs to know which paths are vaults.

Concrete cases:

- "Set up another second-brain" — check the registry first; the user may already have one for this purpose.
- "Open my research second-brain" — look up the registered path.
- "What second-brains do I have?" — list them.
- New machine, vault was synced via git/Dropbox — `vaults add <path>` lets the user re-introduce it.

## CLI commands

```sh
second-brain vaults                     # list (default action)
second-brain vaults list [--json]       # explicit list, optional JSON
second-brain vaults add <path>          # register an existing vault
second-brain vaults remove <path>       # forget a vault (does not delete files)
```

Path resolution is absolute. `vaults add` validates that `<path>/.second-brain.json` exists — refuses to register arbitrary directories.

## Auto-registration

Every successful `second-brain init` auto-registers the new vault. The skill doesn't need to call `vaults add` after a fresh init — the CLI already did it. The "register an existing vault" flow is the only path where the skill calls `vaults add` directly.

## Listing missing vaults

If a vault folder is deleted or moved, `vaults list` marks it `(missing)` but doesn't remove it from the registry. Pruning is manual:

```sh
second-brain vaults remove /old/path
```

This is intentional — the user may have moved the folder temporarily and wants the registry preserved.

## What the skill should do with the registry

- **Before init**: optionally check `vaults list --json` to mention "you already have N vaults" — useful context for the user, not blocking.
- **For register-existing flow**: just `vaults add <path>`. Don't pre-load or validate via separate calls; the CLI does that.
- **For "what second-brains do I have" intent**: this skill doesn't handle that — Claude can run `second-brain vaults` directly via Bash and summarize.
- **Don't write to `~/.second-brain/vaults.json` directly**. Always go through `vaults add` / `vaults remove` so validation runs and the file format stays compatible.

## Per-machine, not synced

The registry lives in the user's home directory and is not synced across machines. The vault folders themselves are typically synced (git, Dropbox, iCloud); the *list of where they are* is per-machine because paths differ across machines (`/home/...` vs `/Users/...` vs `/mnt/c/...`).

On a new machine, the typical flow:

1. Sync the vault folder.
2. Run `second-brain vaults add <path>` once.
3. From then on, the registry knows about it.

Or, if the user runs `second-brain init` on the new machine for a brand-new vault, auto-registration handles it.
