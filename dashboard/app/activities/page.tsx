import { getVaultData } from "@/lib/vault/load";
import { activities } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Timeline } from "@/components/Timeline";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const vault = await getVaultData();
  // Activity-only slice of the timeline, most recent first.
  const entries = vault.timeline.filter((e) => e.role === "activity");
  const count = activities(vault).length;

  return (
    <div>
      <PageHeader title="Activities" count={count} description="Recent activity across the vault." />
      {entries.length === 0 ? (
        <EmptyState>No activities found.</EmptyState>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <Timeline entries={entries} vault={vault} />
        </div>
      )}
    </div>
  );
}
