import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Disclosure de afiliados",
  description:
    "Como funcionam os links de afiliado do Mercado Livre no Pace no Preço.",
  path: "/disclosure",
});

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-display text-5xl italic tracking-tight text-ink md:text-6xl">
        Disclosure de afiliados
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
        <p>
          O Pace no Preço participa do programa de afiliados do Mercado Livre. Isso
          significa que, quando você compra por alguns links deste site, podemos receber
          uma comissão.
        </p>
        <p>
          Essa comissão não aumenta o preço do produto para você. Ela ajuda a manter o
          blog e o grupo de ofertas.
        </p>
        <p>
          Nossas recomendações buscam ser úteis para corredores. Sempre confira a ficha
          técnica, o preço atual e as avaliações na página do Mercado Livre antes de
          comprar.
        </p>
      </div>
    </div>
  );
}
