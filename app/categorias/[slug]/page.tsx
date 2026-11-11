import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-list";
import { getAllCategories, getPostsByCategory } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllCategories().map((category) => ({
    slug: category,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  return buildMetadata({
    title: `Categoria: ${category}`,
    description: `Guias Pace no Preço na categoria ${category}.`,
    path: `/categorias/${encodeURIComponent(category)}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  const posts = getPostsByCategory(category);

  if (!posts.length) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <p className="text-sm font-medium text-court">Categoria</p>
      <h1 className="font-display mt-2 text-4xl italic tracking-tight text-ink sm:text-5xl md:text-6xl">
        {category}
      </h1>
      <div className="mt-12">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
