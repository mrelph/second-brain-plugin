import { getVaultData } from "@/lib/vault/load";
import { projects } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EntityCard } from "@/components/EntityCard";
import { EmptyState } from "@/components/EmptyState";
import { LinkChip } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";
import type { ProjectPage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

// Group order for the status board.
const GROUPS: { key: string; label: string }[] = [
  { key: "blocked", label: "Blocked" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "done", label: "Done" },
  { key: "other", label: "Other" },
];

export default async function ProjectsPage() {
  const vault = await getVaultData();
  const all = projects(vault);

  const grouped: Record<string, ProjectPage[]> = {};
  for (const p of all) {
    const key = GROUPS.some((g) => g.key === p.status) ? (p.status as string) : "other";
    (grouped[key] ??= []).push(p);
  }

  return (
    <div>
      <PageHeader title="Projects" count={all.length} description="Status across key projects." />
      {all.length === 0 && <EmptyState>No projects found. Check your folder/type mappings in vault.config.ts.</EmptyState>}

      {GROUPS.map((g) => {
        const items = grouped[g.key];
        if (!items || items.length === 0) return null;
        return (
          <section key={g.key} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {g.label} <span className="text-slate-400">{items.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <EntityCard
                  key={p.id}
                  page={p}
                  meta={<RelativeDate iso={p.updated} prefix="updated" />}
                >
                  {p.next && (
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-slate-500">Next:</span> {p.next}
                    </p>
                  )}
                  {p.owner && (
                    <div className="mt-2 text-xs text-slate-500">
                      Owner: <LinkChip link={p.owner} vault={vault} />
                    </div>
                  )}
                </EntityCard>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
