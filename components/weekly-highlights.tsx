import Image from "next/image";
import { AffiliateCta } from "@/components/affiliate-cta";
import { Reveal } from "@/components/reveal";
import type { WeeklyHighlights } from "@/lib/schema";

type WeeklyHighlightsSectionProps = {
  data: WeeklyHighlights;
};

export function WeeklyHighlightsSection({ data }: WeeklyHighlightsSectionProps) {
  return (
    <section className="border-y border-line bg-court-soft/50">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Reveal>
          <p className="text-sm font-medium text-court">Em destaque</p>
          <h2 className="font-display mt-2 text-4xl italic tracking-tight text-ink md:text-5xl">
            Destaques da semana
          </h2>
          <p className="mt-3 max-w-[48ch] text-muted">
            Cinco tênis selecionados para esta semana ({data.weekLabel}). Atualizamos
            conforme as melhores ofertas.
          </p>
        </Reveal>

        <ol className="mt-12 divide-y divide-line border-y border-line">
          {data.shoes.map((shoe, index) => {
            const rankLabel = String(shoe.rank).padStart(2, "0");

            return (
              <li key={`${shoe.rank}-${shoe.name}`}>
                <Reveal delay={index * 0.04}>
                  <article className="grid items-center gap-6 py-8 md:grid-cols-[4.5rem_minmax(0,10rem)_minmax(0,1fr)_auto] md:gap-8">
                    <p className="font-display text-5xl italic text-court/30 md:text-6xl">
                      {rankLabel}
                    </p>

                    <div className="relative mx-auto aspect-square w-full max-w-[10rem] overflow-hidden rounded-[var(--radius)] bg-white md:mx-0">
                      <Image
                        src={shoe.image}
                        alt={`${shoe.brand} ${shoe.name}`}
                        fill
                        className="object-contain object-center p-3"
                        sizes="160px"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-court">{shoe.brand}</p>
                      <h3 className="font-display mt-1 text-2xl italic tracking-tight text-ink md:text-3xl">
                        {shoe.name}
                      </h3>
                      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted md:text-base">
                        Ideal para {shoe.bestFor}.
                      </p>
                    </div>

                    <div className="w-full md:w-auto md:justify-self-end">
                      <AffiliateCta href={shoe.affiliateUrl} />
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
