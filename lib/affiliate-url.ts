const ALLOWED_HOSTS = new Set([
  "meli.la",
  "mercadolivre.com.br",
  "www.mercadolivre.com.br",
]);

export function isAllowedAffiliateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    return ALLOWED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function parseAffiliateUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("URL de afiliado inválida");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("URL de afiliado deve usar https");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URL de afiliado não pode ter credenciais");
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error("Host de afiliado não permitido");
  }

  return parsed;
}
