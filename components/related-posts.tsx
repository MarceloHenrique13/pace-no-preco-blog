import Link from "next/link";
import type { Post } from "@/lib/schema";

type RelatedPostsProps = {
  posts: Post[];
};

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="related-posts-heading">
      <h2
        id="related-posts-heading"
        className="font-display text-3xl italic tracking-tight text-ink"
      >
        Continue lendo
      </h2>
      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block text-court hover:underline"
            >
              <span className="font-medium text-ink group-hover:text-court">
                {post.title}
              </span>
              <span className="mt-1 block text-sm text-muted">{post.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
