import Link from "next/link";
import type { Page } from "@/lib/vault/types";
import { hrefForPage } from "@/lib/routes";
import { StatusBadge } from "./StatusBadge";

// Generic card for list views. Title links to the detail page when one exists.
export function EntityCard({
  page,
  meta,
  children,
}: {
  page: Page;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const href = hrefForPage(page);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-slate-900">
          {href ? (
            <Link href={href} className="hover:text-accent">
              {page.title}
            </Link>
          ) : (
            page.title
          )}
        </h3>
        {page.status && <StatusBadge status={page.status} />}
      </div>
      {meta && <div className="mt-2 text-xs text-slate-500">{meta}</div>}
      {children}
      {page.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{page.excerpt}</p>
      )}
    </div>
  );
}
