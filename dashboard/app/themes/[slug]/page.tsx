import { notFound } from "next/navigation";
import { getVaultData } from "@/lib/vault/load";
import { pageBySlug } from "@/lib/vault/selectors";
import { EntityDetail } from "@/components/EntityDetail";
import type { ThemePage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export default async function ThemeDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultData();
  const page = pageBySlug<ThemePage>(vault, slug, "theme");
  if (!page) notFound();

  return (
    <EntityDetail
      page={page}
      vault={vault}
      backHref="/themes"
      backLabel="Themes"
      meta={[{ label: "Status", value: page.status ?? "—" }]}
    />
  );
}
