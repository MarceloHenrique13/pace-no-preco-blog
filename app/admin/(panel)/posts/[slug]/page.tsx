import Link from "next/link";
import { notFound } from "next/navigation";
import { PostLinksForm } from "@/components/admin/post-links-form";
import {
  listOverridesForPost,
  listPublishedSlugs,
} from "@/lib/affiliate-store";
import { requireAdminPage } from "@/lib/admin-guard";
import { getPostBySlug } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminPostLinksPage({ params }: PageProps) {
  await requireAdminPage();
  const { slug } = await params;
  const post = await getPostBySlug(slug, { forAdmin: true });
  if (!post) notFound();

  const [overrides, publishedSlugs] = await Promise.all([
    listOverridesForPost(slug),
    listPublishedSlugs(),
  ]);

  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-court hover:underline">
        ← Posts
      </Link>
      <h2 className="font-display mt-4 text-3xl italic text-ink">{post.title}</h2>
      <p className="mt-2 text-sm text-muted">
        draft: {String(post.draft)} · slug: {post.slug}
      </p>
      <div className="mt-8">
        <PostLinksForm
          slug={post.slug}
          publishedViaAdmin={publishedSlugs.has(post.slug)}
          shoes={post.shoes.map((shoe) => ({
            name: shoe.name,
            brand: shoe.brand,
            mdxUrl: shoe.affiliateUrl,
            overrideUrl: overrides.get(shoe.name) ?? null,
          }))}
        />
      </div>
    </div>
  );
}
