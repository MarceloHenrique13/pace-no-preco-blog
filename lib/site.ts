export const siteConfig = {
  name: "Pace no Preço",
  shortName: "Pace",
  description:
    "Guias de corrida e tênis para o público brasileiro, com indicação prática e ofertas do grupo Pace no Preço.",
  locale: "pt_BR",
  country: "BR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL ??
    "https://chat.whatsapp.com/placeholder",
  twitterHandle: "@pacenopreco",
  author: "Pace no Preço",
  logoPath: "/images/og-default.svg",
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
