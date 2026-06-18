import Link from "next/link";
import type { LinkRef, VaultData } from "@/lib/vault/types";
import { hrefForPage } from "@/lib/routes";

// Render a link reference as a chip. Resolved links that point at a page with a
// detail route become real links; resolved-but-routeless and dangling links
// render as muted text so missing pages stay visible rather than silent.
export function LinkChip({ link, vault }: { link: LinkRef; vault: VaultData }) {
  const target = link.resolvedId ? vault.byId[link.resolvedId] : undefined;
  const href = target ? hrefForPage(target) : null;
  const label = target?.title ?? link.rawTarget;

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
      >
        {label}
      </Link>
    );
  }

  const dangling = !target;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs ${
        dangling
          ? "border border-dashed border-slate-300 text-slate-400"
          : "bg-slate-100 text-slate-600"
      }`}
      title={dangling ? "No matching page in the vault" : undefined}
    >
      {label}
    </span>
  );
}

export function LinkChips({ links, vault }: { links: LinkRef[]; vault: VaultData }) {
  if (links.length === 0) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {links.map((l) => (
        <LinkChip key={l.slug} link={l} vault={vault} />
      ))}
    </span>
  );
}
