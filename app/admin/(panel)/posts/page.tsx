import Link from "next/link";
import {
  listAllOverrides,
  listPublishedSlugs,
} from "@/lib/affiliate-store";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAllPosts } from "@/lib/content";
import { allShoesHaveOverrides, isPostPublic } from "@/lib/publish";

export default async function AdminPostsPage() {
  await requireAdminPage();
  const [posts, publishedSlugs, overridesByPost] = await Promise.all([
    getAllPosts({ forAdmin: true }),
    listPublishedSlugs(),
    listAllOverrides(),
  ]);

  const enriched = posts.map((post) => {
    const overrides = overridesByPost.get(post.slug) ?? new Map();
    const linksReady = allShoesHaveOverrides(
      post.shoes.map((shoe) => shoe.name),
      new Set(overrides.keys()),
    );
    const isPublic = isPostPublic(post, publishedSlugs);
    return { post, overrides, linksReady, isPublic };
  });

  const waiting = enriched.filter((item) => !item.isPublic);
  const live = enriched.filter((item) => item.isPublic);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-3xl italic text-ink">Posts</h2>
        <p className="mt-2 text-sm text-muted">
          Preencha os links afiliados e publique. Posts em draft só sobem depois do
          Publicar.
        </p>
      </div>

      <Section title="Aguardando links/publicação" items={waiting} empty="Nada pendente." />
      <Section title="No ar" items={live} empty="Nenhum post público." />
    </div>
  );
}

function Section({
  title,
  items,
  empty,
}: {
  title: string;
  empty: string;
  items: {
    post: { slug: string; title: string; shoes: { name: string }[] };
    overrides: Map<string, string>;
    linksReady: boolean;
    isPublic: boolean;
  }[];
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map(({ post, overrides, linksReady, isPublic }) => (
            <li key={post.slug}>
              <Link
                href={`/admin/posts/${post.slug}`}
                className="block rounded-xl border border-line bg-white p-4 hover:border-court"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{post.title}</p>
                  <span className="text-xs text-muted">
                    {overrides.size}/{post.shoes.length} links
                    {linksReady ? " · pronto" : " · incompleto"}
                    {isPublic ? " · no ar" : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{post.slug}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
