import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

function MdxLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  if (href.startsWith("#")) return <a href={href} {...rest}>{children}</a>;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}

/**
 * Renders trusted, repository-owned MDX on the server (no client JS for content).
 * `blockJS` stays at its default (true): content files cannot contain executable expressions.
 */
export function MdxContent({ source, lang }: { source: string; lang: string }) {
  return (
    <div className="prose-space" lang={lang}>
      <MDXRemote
        source={source}
        components={{ a: MdxLink }}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
      />
    </div>
  );
}
