import { notFound } from "next/navigation";
import { getVaultData } from "@/lib/vault/load";
import { pageBySlug } from "@/lib/vault/selectors";
import { EntityDetail } from "@/components/EntityDetail";
import { RelativeDate } from "@/components/RelativeDate";
import type { OrgPage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export default async function OrgDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultData();
  const page = pageBySlug<OrgPage>(vault, slug, "org");
  if (!page) notFound();

  return (
    <EntityDetail
      page={page}
      vault={vault}
      backHref="/orgs"
      backLabel="Orgs"
      meta={[
        { label: "Domain", value: page.domain ?? "—" },
        { label: "Status", value: page.status ?? "—" },
        { label: "Last touchpoint", value: <RelativeDate iso={page.lastTouchpoint} /> },
      ]}
    />
  );
}
