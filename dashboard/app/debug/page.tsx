import { getVaultData } from "@/lib/vault/load";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const vault = await getVaultData();

  return (
    <div>
      <PageHeader
        title="Debug"
        description="How the dashboard classified your vault. Use this to tune vault.config.ts."
      />

      <Section title={`Warnings (${vault.warnings.length})`}>
        {vault.warnings.length === 0 ? (
          <p className="text-sm text-slate-500">None.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
            {vault.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Unmapped entity types (${vault.unmatchedEntityTypes.length})`}>
        {vault.unmatchedEntityTypes.length === 0 ? (
          <p className="text-sm text-slate-500">
            All declared entityTypes mapped to a dashboard role.
          </p>
        ) : (
          <div className="text-sm text-slate-600">
            <p className="mb-2">
              These entityTypes from <code>.second-brain.json</code> didn&apos;t map to a role. Add
              them to <code>entityTypeRoles</code> in <code>vault.config.ts</code>:
            </p>
            <div className="flex flex-wrap gap-2">
              {vault.unmatchedEntityTypes.map((t) => (
                <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title={`Page classification (${vault.pages.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Path</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Derived</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vault.pages.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{p.relPath}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{p.role}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{p.status ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500">{p.date ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{p.derived.join("; ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}
