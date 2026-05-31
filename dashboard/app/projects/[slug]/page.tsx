import { notFound } from "next/navigation";
import { getVaultData } from "@/lib/vault/load";
import { pageBySlug } from "@/lib/vault/selectors";
import { EntityDetail } from "@/components/EntityDetail";
import { LinkChip } from "@/components/LinkChip";
import { RelativeDate } from "@/components/RelativeDate";
import type { ProjectPage } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vault = await getVaultData();
  const page = pageBySlug<ProjectPage>(vault, slug, "project");
  if (!page) notFound();

  return (
    <EntityDetail
      page={page}
      vault={vault}
      backHref="/projects"
      backLabel="Projects"
      meta={[
        { label: "Status", value: page.status ?? "unknown" },
        { label: "Updated", value: <RelativeDate iso={page.updated} /> },
        { label: "Next", value: page.next ?? "—" },
        {
          label: "Owner",
          value: page.owner ? <LinkChip link={page.owner} vault={vault} /> : "—",
        },
      ]}
    />
  );
}
