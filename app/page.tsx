import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PostList } from "@/components/post-list";
import { WeeklyHighlightsSection } from "@/components/weekly-highlights";
import { WhatsAppBanner } from "@/components/whatsapp-banner";
import { getAllPosts, getWeeklyHighlights } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const instant = false;

export default async function HomePage() {
  const [posts, weeklyHighlights] = await Promise.all([
    getAllPosts(),
    getWeeklyHighlights(),
  ]);

  return (
    <>
      <section className="relative min-h-[100dvh] overflow-hidden">
        <Image
          src="/images/hero/runner.jpg"
          alt="Corredor em ritmo de treino"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/25" />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-28 md:px-6 md:pb-20">
          <p className="font-display text-2xl italic text-white sm:text-3xl md:text-4xl">
            {siteConfig.name}
          </p>
          <h1 className="font-display mt-3 max-w-[14ch] text-[2.5rem] italic leading-[1.05] tracking-tight text-white sm:text-5xl md:text-7xl">
            Onde preço baixo e qualidade se encontram.
          </h1>
          <p className="mt-4 max-w-[36ch] text-base leading-relaxed text-white/85 md:text-lg">
            Guias de corrida e rankings para escolher bem e comprar com confiança.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-court"
            >
              Entrar no grupo
            </a>
            <Link
              href="/blog"
              className="btn-press inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white"
            >
              Ver guias
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Reveal>
          <h2 className="font-display text-4xl italic tracking-tight text-ink md:text-5xl">
            Últimos guias
          </h2>
          <p className="mt-3 max-w-[50ch] text-muted">
            Rankings e comparativos pensados para quem corre de verdade e quer pagar menos.
          </p>
        </Reveal>
        <div className="mt-10">
          <PostList posts={posts.slice(0, 4)} />
        </div>
        <div className="mt-8">
          <Link href="/blog" className="text-sm font-semibold text-court hover:underline">
            Ver todos os guias
          </Link>
        </div>
      </section>

      <WeeklyHighlightsSection data={weeklyHighlights} />

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Reveal>
          <WhatsAppBanner />
        </Reveal>
      </section>
    </>
  );
}
