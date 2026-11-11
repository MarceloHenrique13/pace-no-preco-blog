import type { Metadata } from "next";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Grupo de ofertas",
  description:
    "Entre no grupo WhatsApp Pace no Preço e receba promoções de tênis de corrida.",
  path: "/grupo",
});

export default function GrupoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="text-sm font-medium text-court">Comunidade</p>
      <h1 className="font-display mt-3 text-4xl italic tracking-tight text-ink sm:text-5xl md:text-6xl">
        Grupo Pace no Preço
      </h1>
      <p className="mt-5 max-w-[55ch] text-base leading-relaxed text-muted sm:text-lg">
        Promoções de tênis de corrida no Mercado Livre, selecionadas para quem treina de
        verdade. Sem spam, com foco em custo-benefício.
      </p>
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-press mt-10 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-court px-6 py-3.5 text-sm font-semibold text-white sm:w-auto"
      >
        <WhatsappLogo weight="fill" className="size-5" aria-hidden />
        Entrar no WhatsApp
      </a>
    </div>
  );
}
