import { getVaultData } from "@/lib/vault/load";
import { orgs } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EntityCard } from "@/components/EntityCard";
import { EmptyState } from "@/components/EmptyState";
import { RelativeDate } from "@/components/RelativeDate";

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const vault = await getVaultData();
  const all = orgs(vault)
    .slice()
    .sort((a, b) => (b.lastTouchpoint ?? "").localeCompare(a.lastTouchpoint ?? ""));

  return (
    <div>
      <PageHeader title="Orgs" count={all.length} description="Organizations and recent touchpoints." />
      {all.length === 0 ? (
        <EmptyState>No organizations found.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {all.map((o) => (
            <EntityCard
              key={o.id}
              page={o}
              meta={
                <span className="flex flex-wrap gap-x-3">
                  {o.domain && <span>{o.domain}</span>}
                  <RelativeDate iso={o.lastTouchpoint} prefix="last touchpoint" />
                  <span>
                    {o.backlinks.length} linked page{o.backlinks.length === 1 ? "" : "s"}
                  </span>
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
