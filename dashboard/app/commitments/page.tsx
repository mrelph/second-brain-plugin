import { getVaultData } from "@/lib/vault/load";
import { commitments } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { LinkChip } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";

export const dynamic = "force-dynamic";

export default async function CommitmentsPage() {
  const vault = await getVaultData();
  const all = commitments(vault).slice().sort((a, b) => {
    // Overdue first, then open, then by due date.
    const rank = (c: typeof a) => (c.isOverdue ? 0 : c.status === "done" ? 2 : 1);
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return (a.due ?? "9999").localeCompare(b.due ?? "9999");
  });

  return (
    <div>
      <PageHeader title="Commitments" count={all.length} description="Owner, due date, status, and source." />
      {all.length === 0 ? (
        <EmptyState>No commitments found.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2">Commitment</th>
                <th className="px-4 py-2">Owner</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {all.map((c) => (
                <tr key={c.id} className={c.isOverdue ? "bg-rose-50/50" : undefined}>
                  <td className="px-4 py-2 font-medium text-slate-800">{c.title}</td>
                  <td className="px-4 py-2">
                    {c.owner ? <LinkChip link={c.owner} vault={vault} /> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <RelativeDate iso={c.due} />
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={c.isOverdue ? "overdue" : c.status} />
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">{c.source ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
