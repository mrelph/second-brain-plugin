import Link from "next/link";
import type { TimelineEntry, VaultData } from "@/lib/vault/types";
import { hrefForPage } from "@/lib/routes";
import { RelativeDate } from "./RelativeDate";

export function Timeline({
  entries,
  vault,
}: {
  entries: TimelineEntry[];
  vault: VaultData;
}) {
  return (
    <ol className="relative border-l border-slate-200 pl-6">
      {entries.map((entry, i) => {
        const page = vault.byId[entry.pageId];
        const href = page ? hrefForPage(page) : null;
        return (
          <li key={`${entry.pageId}-${i}`} className="mb-5 ml-2">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-300" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RelativeDate iso={entry.date} />
              <span className="rounded bg-slate-100 px-1.5 py-0.5 uppercase tracking-wide">
                {entry.kind}
              </span>
            </div>
            <div className="mt-0.5 font-medium text-slate-800">
              {href ? (
                <Link href={href} className="hover:text-accent">
                  {entry.title}
                </Link>
              ) : (
                entry.title
              )}
            </div>
            {entry.summary && (
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{entry.summary}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
