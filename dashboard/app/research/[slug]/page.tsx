import { notFound } from "next/navigation";
import { getVaultData } from "@/lib/vault/load";
import { pageBySlug } from "@/lib/vault/selectors";
import { EntityDetail } from "@/components/EntityDetail";
import { LinkChips } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";
import type { ResearchPage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export default async function ResearchDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultData();
  const page = pageBySlug<ResearchPage>(vault, slug, "research");
  if (!page) notFound();

  return (
    <EntityDetail
      page={page}
      vault={vault}
      backHref="/research"
      backLabel="Research"
      meta={[
        { label: "Status", value: page.status ?? "—" },
        { label: "Date", value: <RelativeDate iso={page.date} /> },
        {
          label: "Source",
          value: page.sourceUrl ? (
            <a href={page.sourceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              link
            </a>
          ) : (
            "—"
          ),
        },
        {
          label: "Authors",
          value: page.authors.length ? <LinkChips links={page.authors} vault={vault} /> : "—",
        },
      ]}
    />
  );
}
