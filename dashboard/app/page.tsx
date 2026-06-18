import Link from "next/link";
import { getVaultData } from "@/lib/vault/load";
import {
  activeProjects,
  blockedProjects,
  overdueCommitments,
  openCommitments,
  staleContacts,
  themesByLinkCount,
  toReadResearch,
} from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RelativeDate } from "@/components/RelativeDate";
import { Timeline } from "@/components/Timeline";
import { hrefForPage } from "@/lib/routes";

export const dynamic = "force-dynamic";

function Card({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-accent hover:underline">
            View all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const vault = await getVaultData();
  const blocked = blockedProjects(vault);
  const active = activeProjects(vault);
  const overdue = overdueCommitments(vault);
  const open = openCommitments(vault);
  const stale = staleContacts(vault);
  const toRead = toReadResearch(vault);
  const themeRank = themesByLinkCount(vault).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={vault.config.schema.domain}
      />

      {/* Vault health strip */}
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Stat label="Pages" value={vault.pages.length} />
        <Stat label="Active projects" value={active.length} />
        <Stat label="Blocked" value={blocked.length} tone={blocked.length ? "warn" : undefined} />
        <Stat label="Open commitments" value={open.length} />
        <Stat label="Overdue" value={overdue.length} tone={overdue.length ? "bad" : undefined} />
        <Link href="/debug" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-500 hover:bg-slate-100">
          {vault.warnings.length} warning{vault.warnings.length === 1 ? "" : "s"} · {vault.unmatchedEntityTypes.length} unmapped
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Needs attention" href="/projects">
          {blocked.length === 0 && overdue.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing blocked or overdue. 🎉</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {blocked.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <Link href={hrefForPage(p)!} className="text-slate-800 hover:text-accent">
                    {p.title}
                  </Link>
                  <StatusBadge status="blocked" />
                </li>
              ))}
              {overdue.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-800">{c.title}</span>
                  <span className="flex items-center gap-2">
                    <RelativeDate iso={c.due} prefix="due" />
                    <StatusBadge status="overdue" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Stale relationships" href="/people">
          {stale.length === 0 ? (
            <p className="text-sm text-slate-500">All contacts are fresh.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stale.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <Link href={hrefForPage(p)!} className="text-slate-800 hover:text-accent">
                    {p.title}
                  </Link>
                  <RelativeDate iso={p.lastContact} prefix="last contact" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top themes" href="/themes">
          {themeRank.length === 0 ? (
            <p className="text-sm text-slate-500">No themes yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {themeRank.map(({ theme, count }) => (
                <li key={theme.id} className="flex items-center justify-between gap-2">
                  <Link href={hrefForPage(theme)!} className="text-slate-800 hover:text-accent">
                    {theme.title}
                  </Link>
                  <span className="text-xs text-slate-400">{count} link{count === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="To read" href="/research">
          {toRead.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing queued.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {toRead.map((r) => (
                <li key={r.id}>
                  <Link href={hrefForPage(r)!} className="text-slate-800 hover:text-accent">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent activity
          </h2>
          <Link href="/activities" className="text-xs text-accent hover:underline">
            View all
          </Link>
        </div>
        <Timeline entries={vault.timeline.slice(0, 8)} vault={vault} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn" | "bad";
}) {
  const toneClass =
    tone === "bad"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-white text-slate-600";
  return (
    <div className={`rounded-md border px-3 py-1.5 ${toneClass}`}>
      <span className="font-semibold">{value}</span> <span className="text-slate-500">{label}</span>
    </div>
  );
}
