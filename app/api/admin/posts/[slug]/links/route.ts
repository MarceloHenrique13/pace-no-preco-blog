import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-auth";
import { isAllowedAffiliateUrl } from "@/lib/affiliate-url";
import {
  listOverridesForPost,
  listPublishedSlugs,
  unpublishPost,
  upsertOverrides,
} from "@/lib/affiliate-store";
import { getPostBySlug } from "@/lib/content";
import { getSql } from "@/lib/db";
import { allShoesHaveOverrides } from "@/lib/publish";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    assertAdminRequest(req);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }

  if (!getSql()) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const { slug } = await context.params;
  const post = await getPostBySlug(slug, { forAdmin: true });
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { links?: { shoeName: string; affiliateUrl: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const links = body.links ?? [];
  const known = new Set(post.shoes.map((shoe) => shoe.name));

  for (const link of links) {
    if (!known.has(link.shoeName)) {
      return NextResponse.json(
        { error: "unknown_shoe", shoeName: link.shoeName },
        { status: 400 },
      );
    }
    const url = link.affiliateUrl.trim();
    if (url && !isAllowedAffiliateUrl(url)) {
      return NextResponse.json(
        { error: "invalid_affiliate_url", shoeName: link.shoeName },
        { status: 400 },
      );
    }
  }

  await upsertOverrides(
    slug,
    links.map((link) => ({
      shoeName: link.shoeName,
      affiliateUrl: link.affiliateUrl.trim() || null,
    })),
  );

  const overrides = await listOverridesForPost(slug);
  const published = await listPublishedSlugs();
  const stillReady = allShoesHaveOverrides(
    post.shoes.map((shoe) => shoe.name),
    new Set(overrides.keys()),
  );

  let unpublished = false;
  if (published.has(slug) && !stillReady) {
    await unpublishPost(slug);
    unpublished = true;
  }

  return NextResponse.json({
    overrides: Object.fromEntries(overrides.entries()),
    unpublished,
  });
}
