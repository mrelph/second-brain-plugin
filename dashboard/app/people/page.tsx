import Link from "next/link";
import { getVaultData } from "@/lib/vault/load";
import { people } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LinkChip } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";
import { hrefForPage } from "@/lib/routes";

export const dynamic = "force-dynamic";

const STRENGTH_LABEL = ["new", "weak", "warm", "strong"];

function StrengthDots({ strength }: { strength?: 0 | 1 | 2 | 3 }) {
  if (strength == null) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5" title={STRENGTH_LABEL[strength]}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i <= strength ? "bg-accent" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

export default async function PeoplePage() {
  const vault = await getVaultData();
  const all = people(vault).slice().sort((a, b) => {
    // Stale contacts first, then by last contact ascending (oldest first).
    if (a.stale !== b.stale) return a.stale ? -1 : 1;
    return (a.lastContact ?? "9999").localeCompare(b.lastContact ?? "9999");
  });

  return (
    <div>
      <PageHeader title="People" count={all.length} description="Relationships and last contact." />
      {all.length === 0 ? (
        <EmptyState>No people found.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Org</th>
                <th className="px-4 py-2">Strength</th>
                <th className="px-4 py-2">Last contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {all.map((p) => (
                <tr key={p.id} className={p.stale ? "bg-amber-50/40" : undefined}>
                  <td className="px-4 py-2 font-medium text-slate-800">
                    <Link href={hrefForPage(p)!} className="hover:text-accent">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{p.personRole ?? "—"}</td>
                  <td className="px-4 py-2">
                    {p.org ? <LinkChip link={p.org} vault={vault} /> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-2">
                    <StrengthDots strength={p.relationshipStrength} />
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <RelativeDate iso={p.lastContact} />
                    {p.stale && <span className="ml-2 text-xs font-medium text-amber-600">stale</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
