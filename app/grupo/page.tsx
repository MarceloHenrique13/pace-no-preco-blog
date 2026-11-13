import type { Metadata } from "next";
import Image from "next/image";
import {
  Lightning,
  SealCheck,
  Sneaker,
  Ticket,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { GroupLink } from "@/components/group-link";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Grupo de ofertas de tênis",
  description:
    "Entre no grupo WhatsApp Pace no Preço e receba promoções de tênis de corrida em lojas oficiais.",
  path: "/grupo",
});

const benefits = [
  {
    icon: Sneaker,
    title: "Tênis com desconto real",
    description:
      "Nike, Adidas, Asics, New Balance, Olympikus e mais — modelos de treino e prova com preço que vale.",
  },
  {
    icon: Ticket,
    title: "Cupons escondidos",
    description: "Cupons de lojas oficiais que quase ninguém encontra sozinho.",
  },
  {
    icon: Lightning,
    title: "Promoções relâmpago",
    description: "Apareceu oferta boa de tênis? Chega na hora no grupo.",
  },
  {
    icon: SealCheck,
    title: "Só lojas oficiais",
    description: "Mercado Livre, Amazon, Netshoes, Centauro e sites das marcas.",
  },
] as const;

const stores = [
  "Mercado Livre",
  "Amazon",
  "Netshoes",
  "Centauro",
  "Nike",
  "Asics",
  "Olympikus",
  "+ outras",
] as const;

const reasons = [
  {
    number: "01",
    title: "Só o admin fala",
    description: "Sem spam e sem bagunça. Só ofertas de tênis selecionadas.",
  },
  {
    number: "02",
    title: "Grupo fechado",
    description: "Acesso limitado a quem quer aproveitar estoque com desconto real.",
  },
  {
    number: "03",
    title: "Vagas limitadas",
    description: "Quando encher, abre fila de espera. Quem entra primeiro, aproveita.",
  },
  {
    number: "04",
    title: "Saiu, perdeu",
    description: "Quem sai precisa pedir de novo — e só entra se ainda tiver vaga.",
  },
] as const;

function GroupCta({
  label,
  className,
  placement,
}: {
  label: string;
  className?: string;
  placement: string;
}) {
  return (
    <GroupLink
      href={siteConfig.whatsappUrl}
      placement={placement}
      className={
        className ??
        "btn-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-court px-6 py-3.5 text-sm font-semibold text-white sm:w-auto"
      }
    >
      <WhatsappLogo weight="fill" className="size-5" aria-hidden />
      {label}
    </GroupLink>
  );
}

export default function GrupoPage() {
  return (
    <>
      <section className="grupo-hero relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-24 md:px-6 md:pb-20 md:pt-28">
        <div className="grupo-hero-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(94,207,142,0.5)] bg-[rgba(94,207,142,0.08)] px-4 py-1.5 text-[0.7rem] font-semibold tracking-[0.14em] text-[#7ddfaa] uppercase">
            <span
              className="grupo-hero-badge-dot size-1.5 rounded-full bg-[#5ecf8e] shadow-[0_0_6px_#5ecf8e]"
              aria-hidden
            />
            Grupo fechado · Vagas limitadas
          </p>

          <h1 className="font-display mt-5 text-[clamp(3.25rem,14vw,6.75rem)] font-bold leading-[0.9] tracking-[-0.03em] text-[#f0f8ff]">
            <span className="block">Pace no</span>
            <span className="grupo-hero-title-accent block">Preço!</span>
          </h1>

          <p className="mt-4 text-sm font-semibold tracking-[0.22em] text-[#9bc9ad] uppercase sm:text-base md:tracking-[0.28em]">
            Só ofertas de tênis
          </p>

          <div className="relative mt-8 w-[clamp(200px,58vw,260px)]">
            <div className="grupo-athlete-card relative w-full overflow-visible rounded-tl-[4px] rounded-tr-[4px]">
              <div
                className="absolute top-0 right-0 left-0 z-10 h-1.5 bg-gradient-to-r from-[#5ecf8e] via-[#7ddfaa] to-transparent shadow-[0_0_14px_rgba(94,207,142,0.7)]"
                aria-hidden
              />
              <div
                className="absolute top-0 bottom-0 left-0 z-10 w-[5px] bg-gradient-to-b from-[#5ecf8e] via-[#3aa86f] to-[rgba(94,207,142,0.2)] shadow-[0_0_12px_rgba(94,207,142,0.5)]"
                aria-hidden
              />
              <div className="grupo-athlete-card relative z-[1] aspect-square overflow-hidden">
                <Image
                  src="/images/hero/runner.jpg"
                  alt="Corredor em ritmo de treino"
                  fill
                  priority
                  className="object-cover"
                  sizes="260px"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,20,15,0.55))]"
                  aria-hidden
                />
                <div className="grupo-pace-chip absolute bottom-4 left-3.5 z-10 border-t-2 border-[#5ecf8e] border-r border-b border-l border-r-[rgba(94,207,142,0.25)] border-b-[rgba(94,207,142,0.25)] border-l-[rgba(94,207,142,0.4)] bg-[rgba(7,20,15,0.9)] px-3.5 py-1.5 backdrop-blur-md">
                  <p className="text-[9px] tracking-[0.18em] text-[#6f9a80] uppercase">Pace</p>
                  <p className="font-display text-2xl leading-none font-bold tracking-wide text-[#5ecf8e]">
                    5&apos;10&quot;
                  </p>
                  <p className="text-[9px] tracking-wider text-[#6f9a80]">min/km</p>
                </div>
              </div>
            </div>
            <p
              className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(4rem,22vw,7rem)] font-bold tracking-[-0.06em] text-[rgba(94,207,142,0.06)] select-none"
              aria-hidden
            >
              RUN
            </p>
          </div>

          <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-relaxed text-[#9bc9ad] sm:text-base">
            Descubro os melhores achados da internet de tênis de corrida — com preço que vale a
            pena.
          </p>

          <GroupCta
            label="Entrar no grupo"
            placement="topo"
            className="grupo-hero-cta btn-press mt-7 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#1b3d2f] via-[#2a5c44] to-[#3aa86f] px-8 py-3.5 text-sm font-bold tracking-[0.08em] text-white uppercase sm:w-auto"
          />
          <p className="mt-3 text-sm font-medium tracking-wide text-[#5ecf8e]">
            Vagas limitadas! Já garante a sua.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,color-mix(in_srgb,var(--court-soft)_55%,white),var(--surface)_42%)]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.16em] text-court uppercase">
              O que você recebe
            </p>
            <h2 className="font-display mt-3 max-w-[16ch] text-4xl italic tracking-tight text-ink md:text-5xl">
              Ofertas de tênis que realmente valem.
            </h2>
            <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-muted md:text-lg">
              Achados, cupons e promoções de corrida direto no WhatsApp — sem dispersar para
              outros nichos.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={0.05 * index}>
                  <div className="flex gap-4">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-court text-white">
                      <Icon weight="fill" className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Reveal>
          <p className="text-sm font-semibold tracking-[0.16em] text-court uppercase">
            Onde monitoramos
          </p>
          <h2 className="font-display mt-3 max-w-[14ch] text-4xl italic tracking-tight text-ink md:text-5xl">
            Várias lojas. Um grupo.
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg">
            Acompanhamos preços de tênis de corrida nas principais lojas e marcas — e mandamos
            só o que vale.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-base font-medium text-ink md:text-lg">
            {stores.map((store) => (
              <li key={store} className="border-b border-court/25 pb-0.5">
                {store}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="border-y border-line bg-court-soft/45">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <Reveal>
            <p className="text-sm font-semibold tracking-[0.16em] text-court uppercase">
              Por que entrar agora
            </p>
            <h2 className="font-display mt-3 max-w-[18ch] text-4xl italic tracking-tight text-ink md:text-5xl">
              Oferta boa some rápido. Quem está no grupo aproveita.
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <Reveal key={reason.number} delay={0.05 * index}>
                <li>
                  <p className="font-display text-4xl italic text-court/35 md:text-5xl">
                    {reason.number}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-ink">{reason.title}</h3>
                  <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-muted md:text-base">
                    {reason.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <Reveal>
          <aside className="relative overflow-hidden rounded-[var(--radius)] bg-court px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 left-10 size-72 rounded-full bg-white/5 blur-3xl"
              aria-hidden
            />
            <p className="text-sm font-semibold tracking-[0.16em] text-white/70 uppercase">
              Vagas se esgotando
            </p>
            <h2 className="font-display relative mt-4 max-w-[12ch] text-4xl italic tracking-tight sm:text-5xl md:text-6xl">
              Não fique de fora. Entra!
            </h2>
            <p className="relative mt-4 max-w-[42ch] text-base leading-relaxed text-white/80 md:text-lg">
              Cada dia fora do grupo é um desconto de tênis que você perdeu. Entra agora antes
              que as vagas acabem.
            </p>
            <div className="relative mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <GroupCta
                label="Entrar no grupo agora"
                placement="rodape"
                className="btn-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-court sm:w-auto"
              />
              <p className="text-sm text-white/75">Grátis. Para sempre. Só ofertas de tênis.</p>
            </div>
          </aside>
        </Reveal>
      </section>
    </>
  );
}
