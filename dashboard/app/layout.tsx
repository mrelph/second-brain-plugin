import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getVaultData } from "@/lib/vault/load";

export const metadata: Metadata = {
  title: "Second Brain Dashboard",
  description: "Read-only dashboard over a second-brain markdown vault",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const vault = await getVaultData();
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar projectName={vault.config.projectName} />
          <main className="flex-1 px-8 py-6">
            {vault.usingSampleVault && (
              <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Showing the bundled <strong>sample vault</strong>. Set{" "}
                <code className="rounded bg-amber-100 px-1">VAULT_PATH</code> in{" "}
                <code className="rounded bg-amber-100 px-1">.env</code> to point at your real
                vault.
              </div>
            )}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
