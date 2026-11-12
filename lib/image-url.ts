/** Accept site-relative paths or absolute http(s) URLs (Blob, ML CDN, etc.). */
export function isAllowedImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.length > 1 && !trimmed.includes("\n");
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
