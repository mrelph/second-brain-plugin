import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        That page isn&apos;t in the vault.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
