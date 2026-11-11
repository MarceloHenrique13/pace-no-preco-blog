import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/schema";

type PostListProps = {
  posts: Post[];
};

export function PostList({ posts }: PostListProps) {
  if (!posts.length) {
    return (
      <p className="text-muted">Nenhum guia publicado ainda. Volte em breve.</p>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {posts.map((post) => {
        const date = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(post.publishedAt);

        return (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group grid gap-5 py-8 transition-colors md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-court-soft">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 180px"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span className="text-court">{post.category}</span>
                  <time dateTime={post.publishedAt.toISOString()}>{date}</time>
                </div>
                <h2 className="font-display mt-2 text-2xl italic tracking-tight text-ink group-hover:text-court md:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted md:text-base">
                  {post.description}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
