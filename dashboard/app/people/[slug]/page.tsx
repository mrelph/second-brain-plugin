import { notFound } from "next/navigation";
import { getVaultData } from "@/lib/vault/load";
import { pageBySlug } from "@/lib/vault/selectors";
import { EntityDetail } from "@/components/EntityDetail";
import { LinkChip } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";
import type { PersonPage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export default async function PersonDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultData();
  const page = pageBySlug<PersonPage>(vault, slug, "person");
  if (!page) notFound();

  return (
    <EntityDetail
      page={page}
      vault={vault}
      backHref="/people"
      backLabel="People"
      meta={[
        { label: "Role", value: page.personRole ?? "—" },
        { label: "Org", value: page.org ? <LinkChip link={page.org} vault={vault} /> : "—" },
        { label: "Relationship", value: page.relationship ?? "—" },
        {
          label: "Last contact",
          value: (
            <span>
              <RelativeDate iso={page.lastContact} />
              {page.stale && <span className="ml-1 text-xs text-amber-600">stale</span>}
            </span>
          ),
        },
      ]}
    />
  );
}
