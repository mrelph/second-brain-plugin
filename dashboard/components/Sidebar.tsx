import Link from "next/link";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/people", label: "People" },
  { href: "/orgs", label: "Orgs" },
  { href: "/commitments", label: "Commitments" },
  { href: "/activities", label: "Activities" },
  { href: "/themes", label: "Themes" },
  { href: "/research", label: "Research" },
  { href: "/debug", label: "Debug" },
];

export function Sidebar({ projectName }: { projectName: string }) {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-slate-400">Second Brain</div>
        <div className="mt-1 text-lg font-semibold leading-tight text-slate-900">
          {projectName}
        </div>
      </div>
      <nav className="space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
