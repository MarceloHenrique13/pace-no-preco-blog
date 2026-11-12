import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-auth";
import {
  COVER_IMAGE_TARGET,
  listImageOverridesForPost,
  upsertImageOverrides,
} from "@/lib/affiliate-store";
import { getPostBySlug } from "@/lib/content";
import { getSql } from "@/lib/db";
import { isAllowedImageUrl } from "@/lib/image-url";

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

  let body: {
    coverImage?: string | null;
    shoes?: { shoeName: string; imageUrl: string | null }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const known = new Set(post.shoes.map((shoe) => shoe.name));
  const items: { target: string; imageUrl: string | null }[] = [];

  if ("coverImage" in body) {
    const cover = body.coverImage?.trim() ?? "";
    if (cover && !isAllowedImageUrl(cover)) {
      return NextResponse.json({ error: "invalid_cover_image" }, { status: 400 });
    }
    items.push({
      target: COVER_IMAGE_TARGET,
      imageUrl: cover || null,
    });
  }

  for (const shoe of body.shoes ?? []) {
    if (!known.has(shoe.shoeName)) {
      return NextResponse.json(
        { error: "unknown_shoe", shoeName: shoe.shoeName },
        { status: 400 },
      );
    }
    const url = shoe.imageUrl?.trim() ?? "";
    if (url && !isAllowedImageUrl(url)) {
      return NextResponse.json(
        { error: "invalid_shoe_image", shoeName: shoe.shoeName },
        { status: 400 },
      );
    }
    items.push({
      target: shoe.shoeName,
      imageUrl: url || null,
    });
  }

  if (!items.length) {
    return NextResponse.json({ error: "empty_payload" }, { status: 400 });
  }

  await upsertImageOverrides(slug, items);
  const overrides = await listImageOverridesForPost(slug);

  return NextResponse.json({
    coverImage: overrides.coverImage,
    shoes: Object.fromEntries(overrides.shoes.entries()),
  });
}
