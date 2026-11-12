import { getSql } from "@/lib/db";
import { weeklyHighlightsSchema, type WeeklyHighlights } from "@/lib/schema";

type OverrideRow = {
  shoe_name: string;
  affiliate_url: string;
};

type HighlightRow = {
  week_label: string;
  updated_at: string | Date;
  shoes: unknown;
};

export async function listOverridesForPost(
  slug: string,
): Promise<Map<string, string>> {
  const sql = getSql();
  if (!sql) return new Map();

  try {
    const rows = (await sql`
      SELECT shoe_name, affiliate_url
      FROM affiliate_overrides
      WHERE post_slug = ${slug}
    `) as OverrideRow[];

    return new Map(rows.map((row) => [row.shoe_name, row.affiliate_url]));
  } catch (error) {
    console.error("listOverridesForPost failed", error);
    return new Map();
  }
}

let lastPublishedSlugs: Set<string> | null = null;

export async function listPublishedSlugs(): Promise<Set<string>> {
  const sql = getSql();
  if (!sql) return lastPublishedSlugs ?? new Set();

  try {
    const rows = (await sql`
      SELECT post_slug FROM post_publications
    `) as { post_slug: string }[];
    const next = new Set(rows.map((row) => row.post_slug));
    lastPublishedSlugs = next;
    return next;
  } catch (error) {
    console.error("listPublishedSlugs failed", error);
    // Stay up with last known publish set (stale) rather than hiding drafts.
    return lastPublishedSlugs ?? new Set();
  }
}

/** Test helper — reset in-memory publish cache. */
export function __resetPublishedSlugCacheForTests() {
  lastPublishedSlugs = null;
}

export async function getWeeklyHighlightsFromStore(): Promise<WeeklyHighlights | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = (await sql`
      SELECT week_label, updated_at, shoes
      FROM weekly_highlights
      WHERE id = 1
      LIMIT 1
    `) as HighlightRow[];

    if (!rows.length) return null;

    const parsed = weeklyHighlightsSchema.safeParse({
      weekLabel: rows[0].week_label,
      updatedAt: rows[0].updated_at,
      shoes: rows[0].shoes,
    });

    if (!parsed.success) {
      console.error("weekly_highlights row invalid", parsed.error);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("getWeeklyHighlightsFromStore failed", error);
    return null;
  }
}

export async function upsertOverrides(
  slug: string,
  items: { shoeName: string; affiliateUrl: string | null }[],
): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  for (const item of items) {
    const url = item.affiliateUrl?.trim() ?? "";
    if (!url) {
      await sql`
        DELETE FROM affiliate_overrides
        WHERE post_slug = ${slug} AND shoe_name = ${item.shoeName}
      `;
      continue;
    }

    await sql`
      INSERT INTO affiliate_overrides (post_slug, shoe_name, affiliate_url, updated_at)
      VALUES (${slug}, ${item.shoeName}, ${url}, now())
      ON CONFLICT (post_slug, shoe_name)
      DO UPDATE SET affiliate_url = EXCLUDED.affiliate_url, updated_at = now()
    `;
  }
}

export async function saveWeeklyHighlights(
  data: WeeklyHighlights,
): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  const updatedAt =
    data.updatedAt instanceof Date
      ? data.updatedAt.toISOString()
      : String(data.updatedAt);
  const shoesJson = JSON.stringify(data.shoes);

  await sql`
    INSERT INTO weekly_highlights (id, week_label, updated_at, shoes)
    VALUES (1, ${data.weekLabel}, ${updatedAt}::timestamptz, ${shoesJson}::jsonb)
    ON CONFLICT (id)
    DO UPDATE SET
      week_label = EXCLUDED.week_label,
      updated_at = EXCLUDED.updated_at,
      shoes = EXCLUDED.shoes
  `;
}

export async function seedWeeklyHighlightsIfEmpty(
  seed: WeeklyHighlights,
): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    const rows = (await sql`
      SELECT id FROM weekly_highlights WHERE id = 1 LIMIT 1
    `) as { id: number }[];
    if (rows.length) return;
    await saveWeeklyHighlights(seed);
  } catch (error) {
    console.error("seedWeeklyHighlightsIfEmpty failed", error);
  }
}

export async function publishPost(slug: string): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  await sql`
    INSERT INTO post_publications (post_slug, published_at)
    VALUES (${slug}, now())
    ON CONFLICT (post_slug)
    DO UPDATE SET published_at = now()
  `;
}

export async function unpublishPost(slug: string): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  await sql`
    DELETE FROM post_publications WHERE post_slug = ${slug}
  `;
}

export async function listAllOverrides(): Promise<
  Map<string, Map<string, string>>
> {
  const sql = getSql();
  const byPost = new Map<string, Map<string, string>>();
  if (!sql) return byPost;

  try {
    const rows = (await sql`
      SELECT post_slug, shoe_name, affiliate_url
      FROM affiliate_overrides
    `) as { post_slug: string; shoe_name: string; affiliate_url: string }[];

    for (const row of rows) {
      const map = byPost.get(row.post_slug) ?? new Map<string, string>();
      map.set(row.shoe_name, row.affiliate_url);
      byPost.set(row.post_slug, map);
    }
  } catch (error) {
    console.error("listAllOverrides failed", error);
  }

  return byPost;
}

/** Cover image override key in post_image_overrides.target */
export const COVER_IMAGE_TARGET = "__cover__";

export type PostImageOverrides = {
  coverImage: string | null;
  shoes: Map<string, string>;
};

export async function listImageOverridesForPost(
  slug: string,
): Promise<PostImageOverrides> {
  const empty: PostImageOverrides = { coverImage: null, shoes: new Map() };
  const sql = getSql();
  if (!sql) return empty;

  try {
    const rows = (await sql`
      SELECT target, image_url
      FROM post_image_overrides
      WHERE post_slug = ${slug}
    `) as { target: string; image_url: string }[];

    const shoes = new Map<string, string>();
    let coverImage: string | null = null;
    for (const row of rows) {
      if (row.target === COVER_IMAGE_TARGET) {
        coverImage = row.image_url;
      } else {
        shoes.set(row.target, row.image_url);
      }
    }
    return { coverImage, shoes };
  } catch (error) {
    console.error("listImageOverridesForPost failed", error);
    return empty;
  }
}

export async function listAllImageOverrides(): Promise<
  Map<string, PostImageOverrides>
> {
  const byPost = new Map<string, PostImageOverrides>();
  const sql = getSql();
  if (!sql) return byPost;

  try {
    const rows = (await sql`
      SELECT post_slug, target, image_url
      FROM post_image_overrides
    `) as { post_slug: string; target: string; image_url: string }[];

    for (const row of rows) {
      const current = byPost.get(row.post_slug) ?? {
        coverImage: null,
        shoes: new Map<string, string>(),
      };
      if (row.target === COVER_IMAGE_TARGET) {
        current.coverImage = row.image_url;
      } else {
        current.shoes.set(row.target, row.image_url);
      }
      byPost.set(row.post_slug, current);
    }
  } catch (error) {
    console.error("listAllImageOverrides failed", error);
  }

  return byPost;
}

export async function upsertImageOverrides(
  slug: string,
  items: { target: string; imageUrl: string | null }[],
): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL não configurada");

  for (const item of items) {
    const url = item.imageUrl?.trim() ?? "";
    if (!url) {
      await sql`
        DELETE FROM post_image_overrides
        WHERE post_slug = ${slug} AND target = ${item.target}
      `;
      continue;
    }

    await sql`
      INSERT INTO post_image_overrides (post_slug, target, image_url, updated_at)
      VALUES (${slug}, ${item.target}, ${url}, now())
      ON CONFLICT (post_slug, target)
      DO UPDATE SET image_url = EXCLUDED.image_url, updated_at = now()
    `;
  }
}
