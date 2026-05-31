import Link from "next/link";
import type { Page, VaultData } from "@/lib/vault/types";
import { hrefForPage, LIST_ROUTES } from "@/lib/routes";

// Pages that link TO the given page, grouped lightly by role.
export function BacklinksList({ page, vault }: { page: Page; vault: VaultData }) {
  const sources = page.backlinks
    .map((id) => vault.byId[id])
    .filter((p): p is Page => Boolean(p));

  if (sources.length === 0) {
    return <p className="text-sm text-slate-400">No backlinks.</p>;
  }

  return (
    <ul className="space-y-1">
      {sources.map((src) => {
        const href = hrefForPage(src) ?? `${LIST_ROUTES[src.role as keyof typeof LIST_ROUTES] ?? ""}`;
        return (
          <li key={src.id} className="text-sm">
            <span className="mr-2 inline-block w-20 text-xs uppercase tracking-wide text-slate-400">
              {src.role}
            </span>
            {href ? (
              <Link href={href} className="text-slate-700 hover:text-accent">
                {src.title}
              </Link>
            ) : (
              <span className="text-slate-700">{src.title}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
