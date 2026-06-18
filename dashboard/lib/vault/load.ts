import path from "node:path";
import { promises as fs } from "node:fs";
import type { VaultData } from "./types";
import { ROLES } from "./types";
import { loadConfig } from "./config";
import { scanFiles } from "./scan";
import { parsePage } from "./parse";
import { classify } from "./classify";
import { buildIndex } from "./index";
import { buildTimeline } from "./timeline";
import { entityTypeToRole } from "./adapter";

export function resolveVaultPath(): { vaultPath: string; usingSampleVault: boolean } {
  const env = process.env.VAULT_PATH?.trim();
  if (env) {
    return { vaultPath: path.resolve(env), usingSampleVault: false };
  }
  return {
    vaultPath: path.join(process.cwd(), "sample-vault"),
    usingSampleVault: true,
  };
}

// Pure build: given a vault path, produce the full in-memory model. Accepts an
// injectable `now` so tests are deterministic.
export async function buildVaultData(
  vaultPath: string,
  options: { now?: Date; usingSampleVault?: boolean } = {},
): Promise<VaultData> {
  const now = options.now ?? new Date();
  const warnings: string[] = [];

  // Surface a clear error rather than crashing if the path is wrong.
  try {
    const stat = await fs.stat(vaultPath);
    if (!stat.isDirectory()) warnings.push(`VAULT_PATH is not a directory: ${vaultPath}`);
  } catch {
    warnings.push(`Vault path does not exist: ${vaultPath}`);
  }

  const { config, warnings: configWarnings } = await loadConfig(vaultPath);
  warnings.push(...configWarnings);

  const files = await scanFiles(vaultPath);
  const parsed = await Promise.all(files.map((f) => parsePage(f, config)));
  const pages = parsed.map((p) => classify(p, config, now));

  const { byId, bySlug, byRole, edges } = buildIndex(pages);
  const timeline = buildTimeline(pages);

  // Which declared entityTypes did not map to one of the 7 roles?
  const unmatchedEntityTypes = config.schema.entityTypes.filter(
    (t) => entityTypeToRole(t) == null,
  );

  if (options.usingSampleVault) {
    warnings.unshift(
      "Showing the bundled sample vault. Set VAULT_PATH in .env to point at your real second-brain vault.",
    );
  }
  if (pages.length === 0) {
    warnings.push("No markdown pages found in the vault.");
  }

  return {
    config,
    vaultPath,
    usingSampleVault: options.usingSampleVault ?? false,
    pages,
    byId,
    bySlug,
    byRole,
    edges,
    timeline,
    warnings,
    unmatchedEntityTypes,
  };
}

// Module-level cache keyed by vault path. Read-only single-user app, so a
// process-lifetime cache is sufficient; `?refresh=1` clears it.
let cache: { key: string; data: Promise<VaultData> } | null = null;

export function getVaultData(opts: { refresh?: boolean } = {}): Promise<VaultData> {
  const { vaultPath, usingSampleVault } = resolveVaultPath();
  if (opts.refresh || !cache || cache.key !== vaultPath) {
    cache = {
      key: vaultPath,
      data: buildVaultData(vaultPath, { usingSampleVault }),
    };
  }
  return cache.data;
}

export { ROLES };
