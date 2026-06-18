import { formatDate, relativeDate } from "@/lib/vault/format";

export function RelativeDate({
  iso,
  prefix,
}: {
  iso?: string;
  prefix?: string;
}) {
  if (!iso) return <span className="text-slate-400">—</span>;
  return (
    <span title={formatDate(iso)} className="whitespace-nowrap">
      {prefix ? `${prefix} ` : ""}
      {relativeDate(iso)}
    </span>
  );
}
