import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

type PostHeaderProps = {
  post: Post;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function PostHeader({ post }: PostHeaderProps) {
  const published = formatDate(post.publishedAt);
  const updatedAt = post.updatedAt ?? post.publishedAt;
  const showUpdated =
    updatedAt.toISOString().slice(0, 10) !==
    post.publishedAt.toISOString().slice(0, 10);

  return (
    <header className="border-b border-line pb-10">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <Link
          href={`/categorias/${encodeURIComponent(post.category)}`}
          className="font-medium text-court hover:underline"
        >
          {post.category}
        </Link>
        <span aria-hidden>·</span>
        <span>
          Por <span className="text-ink">{siteConfig.author}</span>
        </span>
        <span aria-hidden>·</span>
        <time dateTime={post.publishedAt.toISOString()}>
          Publicado em {published}
        </time>
        {showUpdated && (
          <>
            <span aria-hidden>·</span>
            <time dateTime={updatedAt.toISOString()}>
              Atualizado em {formatDate(updatedAt)}
            </time>
          </>
        )}
        <span aria-hidden>·</span>
        <span>{post.readingTime}</span>
      </div>
      <h1 className="font-display mt-4 max-w-[18ch] text-[2rem] italic tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
        {post.title}
      </h1>
      <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted sm:text-lg">
        {post.description}
      </p>
      <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[var(--radius)] bg-court-soft sm:aspect-[16/9]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 960px"
        />
      </div>
    </header>
  );
}
