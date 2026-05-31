const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  open: "bg-sky-100 text-sky-800",
  blocked: "bg-rose-100 text-rose-800",
  overdue: "bg-rose-100 text-rose-800",
  paused: "bg-amber-100 text-amber-800",
  done: "bg-slate-200 text-slate-600",
  "to-read": "bg-violet-100 text-violet-800",
  reading: "bg-sky-100 text-sky-800",
  read: "bg-slate-200 text-slate-600",
  emerging: "bg-teal-100 text-teal-800",
  dormant: "bg-slate-200 text-slate-600",
  unknown: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status?: string }) {
  const label = status ?? "unknown";
  const color = STATUS_COLORS[label] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
