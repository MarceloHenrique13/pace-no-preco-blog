import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Guias e rankings de tênis de corrida para comparar modelos e preços.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categories = Array.from(
    new Set(posts.map((post) => post.category)),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-display text-4xl italic tracking-tight text-ink sm:text-5xl md:text-6xl">
        Blog
      </h1>
      <p className="mt-4 max-w-[55ch] text-base text-muted sm:text-lg">
        Rankings, comparativos e dicas para escolher tênis de corrida sem cair em hype.
      </p>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/categorias/${encodeURIComponent(category)}`}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-ink hover:border-court hover:text-court"
            >
              {category}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
