import { getVaultData } from "@/lib/vault/load";
import { research } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EntityCard } from "@/components/EntityCard";
import { EmptyState } from "@/components/EmptyState";
import { LinkChips } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const vault = await getVaultData();
  // To-read first, then by date desc.
  const all = research(vault).slice().sort((a, b) => {
    const rank = (s?: string) => (s === "to-read" ? 0 : s === "reading" ? 1 : 2);
    if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
    return (b.date ?? "").localeCompare(a.date ?? "");
  });

  return (
    <div>
      <PageHeader title="Research" count={all.length} description="Notes, papers, and sources." />
      {all.length === 0 ? (
        <EmptyState>No research found.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {all.map((r) => (
            <EntityCard
              key={r.id}
              page={r}
              meta={
                <span className="flex flex-col gap-1">
                  <RelativeDate iso={r.date} />
                  {r.sourceUrl && (
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-accent hover:underline"
                    >
                      {r.sourceUrl}
                    </a>
                  )}
                </span>
              }
            >
              {r.authors.length > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  <LinkChips links={r.authors} vault={vault} />
                </div>
              )}
            </EntityCard>
          ))}
        </div>
      )}
    </div>
  );
}
