import Link from "next/link";
import { getVaultData } from "@/lib/vault/load";
import { themesByLinkCount } from "@/lib/vault/selectors";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { hrefForPage } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const vault = await getVaultData();
  const ranked = themesByLinkCount(vault);

  return (
    <div>
      <PageHeader
        title="Themes"
        count={ranked.length}
        description="Recurring themes, ranked by how much links to them."
      />
      {ranked.length === 0 ? (
        <EmptyState>No themes found.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map(({ theme, count }) => {
            const sources = theme.backlinks
              .map((id) => vault.byId[id])
              .filter(Boolean)
              .slice(0, 4);
            return (
              <div key={theme.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-slate-900">
                    <Link href={hrefForPage(theme)!} className="hover:text-accent">
                      {theme.title}
                    </Link>
                  </h3>
                  {theme.status && <StatusBadge status={theme.status} />}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {count} linked page{count === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                  {sources.map((s) => (
                    <li key={s!.id} className="truncate">
                      <span className="mr-1 text-xs uppercase text-slate-400">{s!.role}</span>
                      {s!.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
