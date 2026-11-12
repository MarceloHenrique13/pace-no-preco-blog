export const AFFILIATE_PLACEHOLDER =
  "https://pendente.invalid/PENDENTE_LINK_AFILIADO";

const AFFILIATE_HOSTS = new Set([
  "meli.la",
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
]);

const BLOCKED_IMAGE_HOSTS = [
  "mlstatic.com",
  "mercadolibre.com",
  "mercadolivre.com",
  "meli.la",
];

export type AffiliateDecision =
  | { kind: "placeholder"; url: string }
  | { kind: "provided"; url: string }
  | { kind: "reject"; reason: string };

function hostnameOf(value: string): string | undefined {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

export function isBlockedCommerceHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return BLOCKED_IMAGE_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`),
  );
}

export function classifyAffiliateUrl(
  value: string,
  providedByMarcelo: readonly string[],
): AffiliateDecision {
  const url = value.trim();
  if (url === AFFILIATE_PLACEHOLDER) {
    return { kind: "placeholder", url };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      kind: "reject",
      reason: `affiliateUrl inválida. Use ${AFFILIATE_PLACEHOLDER} ou um link que o Marcelo colou nesta conversa.`,
    };
  }

  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    return {
      kind: "reject",
      reason: "Link de compra tem de ser https, sem usuário nem senha na URL.",
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (isBlockedCommerceHost(host) && !AFFILIATE_HOSTS.has(host)) {
    return {
      kind: "reject",
      reason:
        "Não acesso, raspo nem uso recurso do Mercado Livre (imagem, mlstatic, outros países).",
    };
  }

  if (!AFFILIATE_HOSTS.has(host)) {
    return {
      kind: "reject",
      reason: `Host de compra não permitido em affiliateUrl. Use ${AFFILIATE_PLACEHOLDER}.`,
    };
  }

  if (!providedByMarcelo.includes(url)) {
    return {
      kind: "reject",
      reason:
        "Não invento link do Mercado Livre nem meli.la. Use o placeholder, ou repita a URL exata que o Marcelo colou no campo linksInformadosPeloMarcelo.",
    };
  }

  return { kind: "provided", url };
}

export function urlsInText(text: string): string[] {
  return text.match(/https?:\/\/[^\s)>"']+/g) ?? [];
}

export function requestsProvidedAffiliate(input: {
  shoes?: readonly { affiliateUrl?: string }[];
  body?: string;
  linksInformadosPeloMarcelo?: readonly string[];
}): boolean {
  const provided = input.linksInformadosPeloMarcelo ?? [];
  if (provided.length === 0) return false;
  const candidates = [
    ...(input.shoes ?? []).map((shoe) => shoe.affiliateUrl ?? ""),
    ...commerceUrlsInText(input.body ?? ""),
  ];
  return candidates.some(
    (url) => url.trim() !== AFFILIATE_PLACEHOLDER && provided.includes(url.trim()),
  );
}

export function commerceUrlsInText(text: string): string[] {
  return urlsInText(text).filter((url) => {
    const host = hostnameOf(url);
    return host ? isBlockedCommerceHost(host) || AFFILIATE_HOSTS.has(host) : false;
  });
}
