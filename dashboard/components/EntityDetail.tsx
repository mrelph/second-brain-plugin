import Link from "next/link";
import type { Page, VaultData } from "@/lib/vault/types";
import { StatusBadge } from "./StatusBadge";
import { Markdown } from "./Markdown";
import { BacklinksList } from "./BacklinksList";
import { LinkChips } from "./LinkChip";

// Shared scaffold for every detail page: header, two-column body (prose +
// metadata sidebar), outbound links, and backlinks.
export function EntityDetail({
  page,
  vault,
  backHref,
  backLabel,
  meta,
}: {
  page: Page;
  vault: VaultData;
  backHref: string;
  backLabel: string;
  meta?: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div>
      <Link href={backHref} className="text-sm text-slate-400 hover:text-accent">
        ← {backLabel}
      </Link>
      <div className="mt-2 mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{page.title}</h1>
        {page.status && <StatusBadge status={page.status} />}
        <span className="text-xs uppercase tracking-wide text-slate-400">{page.role}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Markdown body={page.body} vault={vault} />

          {page.outLinks.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Links out
              </h3>
              <LinkChips links={page.outLinks} vault={vault} />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {meta && meta.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dl className="space-y-2 text-sm">
                {meta.map((m) => (
                  <div key={m.label} className="flex justify-between gap-3">
                    <dt className="text-slate-400">{m.label}</dt>
                    <dd className="text-right text-slate-700">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Backlinks
            </h3>
            <BacklinksList page={page} vault={vault} />
          </div>

          {page.derived.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <h3 className="mb-2 font-semibold uppercase tracking-wide">Derived</h3>
              <ul className="list-disc space-y-1 pl-4">
                {page.derived.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
