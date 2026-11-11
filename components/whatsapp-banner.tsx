import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site";

type WhatsAppBannerProps = {
  compact?: boolean;
};

export function WhatsAppBanner({ compact = false }: WhatsAppBannerProps) {
  return (
    <aside
      className={
        compact
          ? "rounded-[var(--radius)] bg-court px-5 py-8 text-white sm:px-6"
          : "rounded-[var(--radius)] bg-court px-5 py-10 text-white sm:px-6 sm:py-12 md:px-12"
      }
    >
      <p className="font-display text-[1.75rem] italic tracking-tight sm:text-3xl md:text-4xl">
        Ofertas de tênis no WhatsApp
      </p>
      <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-white/80">
        Entre no grupo Pace no Preço e receba promoções de corrida com link direto.
      </p>
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-press mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-court focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
      >
        <WhatsappLogo weight="fill" className="size-5" aria-hidden />
        Entrar no grupo
      </a>
    </aside>
  );
}
