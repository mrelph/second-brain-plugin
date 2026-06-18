import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { VaultData } from "@/lib/vault/types";
import { slugify } from "@/lib/vault/links";
import { hrefForPage } from "@/lib/routes";

// Rewrite [[wikilinks]] (and local .md markdown links) into internal dashboard
// links when the target resolves, otherwise into plain text.
function preprocess(body: string, vault: VaultData): string {
  let out = body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, alias) => {
    const label = (alias || target).trim();
    const page = vault.bySlug[slugify(target)];
    const href = page ? hrefForPage(page) : null;
    return href ? `[${label}](${href})` : label;
  });

  // Convert local .md markdown links to internal routes (or plain text).
  out = out.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (whole, label, target) => {
    const t = String(target).trim();
    if (/^[a-z]+:\/\//i.test(t) || t.startsWith("#") || t.startsWith("/")) return whole;
    if (!t.endsWith(".md") && t.includes(".")) return whole;
    const page = vault.bySlug[slugify(t)];
    const href = page ? hrefForPage(page) : null;
    return href ? `[${label}](${href})` : (label || t);
  });

  return out;
}

export function Markdown({ body, vault }: { body: string; vault: VaultData }) {
  const text = preprocess(body, vault);
  return (
    <div className="prose prose-slate prose-sm max-w-none prose-headings:font-semibold">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href && href.startsWith("/")) {
              return (
                <Link href={href} className="text-accent hover:underline">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
