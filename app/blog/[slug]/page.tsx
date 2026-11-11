import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { mdxComponents } from "@/components/mdx-components";
import { PostFaq } from "@/components/post-faq";
import { PostHeader } from "@/components/post-header";
import { RelatedPosts } from "@/components/related-posts";
import { ShoeCard } from "@/components/shoe-card";
import { WhatsAppBanner } from "@/components/whatsapp-banner";
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  itemListJsonLd,
  postMetadata,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.draft) return {};
  return postMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.draft) notFound();

  const shoes = [...post.shoes].sort((a, b) => a.rank - b.rank);
  const related = getRelatedPosts(post);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(post)} />
      <JsonLd data={itemListJsonLd(post)} />
      <JsonLd data={faqJsonLd(post)} />

      <PostHeader post={post} />

      <div className="prose-pace mt-10">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {shoes.length > 0 && (
        <div className="mt-4">
          {shoes.map((shoe) => (
            <ShoeCard key={`${shoe.rank}-${shoe.name}`} shoe={shoe} />
          ))}
        </div>
      )}

      <PostFaq items={post.faq} />

      <RelatedPosts posts={related} />

      <div className="mt-16">
        <WhatsAppBanner compact />
      </div>
    </article>
  );
}
