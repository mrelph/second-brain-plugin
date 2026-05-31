export function PageHeader({
  title,
  count,
  description,
}: {
  title: string;
  count?: number;
  description?: string;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {count != null && (
          <span className="text-sm font-medium text-slate-400">{count}</span>
        )}
      </div>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </header>
  );
}
