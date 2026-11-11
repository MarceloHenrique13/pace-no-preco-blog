import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null | undefined;

export function getSql(): NeonQueryFunction<false, false> | null {
  if (cached !== undefined) return cached;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    cached = null;
    return cached;
  }

  try {
    cached = neon(url);
  } catch (error) {
    console.error("getSql failed to init neon client", error);
    cached = null;
  }
  return cached;
}
