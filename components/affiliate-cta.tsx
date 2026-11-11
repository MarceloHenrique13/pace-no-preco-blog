import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type AffiliateCtaProps = {
  href: string;
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
};

export function AffiliateCta({
  href,
  label = "Ver preço no Mercado Livre",
  variant = "solid",
  className = "",
}: AffiliateCtaProps) {
  const base =
    "btn-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court sm:w-auto";

  const styles =
    variant === "solid"
      ? "bg-court text-white hover:bg-[#163328]"
      : "border border-court text-court hover:bg-court-soft";

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      {label}
      <ArrowUpRight weight="bold" className="size-4" aria-hidden />
    </a>
  );
}
