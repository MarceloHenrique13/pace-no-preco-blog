import Image from "next/image";
import type { Shoe } from "@/lib/schema";
import { AffiliateCta } from "./affiliate-cta";

type ShoeCardProps = {
  shoe: Shoe;
};

export function ShoeCard({ shoe }: ShoeCardProps) {
  const rankLabel = String(shoe.rank).padStart(2, "0");

  return (
    <section
      id={`tenis-${shoe.rank}`}
      className="scroll-mt-28 border-t border-line py-12 md:py-16"
    >
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius)] bg-court-soft sm:aspect-[4/5]">
          <span className="font-display absolute left-4 top-3 z-10 text-5xl italic text-court/25 sm:text-6xl md:text-7xl">
            {rankLabel}
          </span>
          <Image
            src={shoe.image}
            alt={`${shoe.brand} ${shoe.name}`}
            fill
            className="object-contain object-center p-5 sm:p-6 md:p-8"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-court">{shoe.brand}</p>
          <h2 className="font-display mt-2 text-[1.75rem] italic tracking-tight text-ink sm:text-3xl md:text-4xl">
            {shoe.rank}º lugar: {shoe.name}
          </h2>
          <p className="mt-3 max-w-[55ch] text-base leading-relaxed text-muted">
            Melhor para: {shoe.bestFor}
          </p>

          {shoe.pros.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-ink">Pontos fortes</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                {shoe.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <AffiliateCta href={shoe.affiliateUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
