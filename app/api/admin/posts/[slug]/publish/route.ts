import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-auth";
import {
  listOverridesForPost,
  publishPost,
  unpublishPost,
} from "@/lib/affiliate-store";
import { getPostBySlug } from "@/lib/content";
import { getSql } from "@/lib/db";
import { allShoesHaveOverrides } from "@/lib/publish";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: Request, context: RouteContext) {
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

  const overrides = await listOverridesForPost(slug);
  const ready = allShoesHaveOverrides(
    post.shoes.map((shoe) => shoe.name),
    new Set(overrides.keys()),
  );

  if (!ready) {
    return NextResponse.json(
      { error: "missing_affiliate_links" },
      { status: 409 },
    );
  }

  await publishPost(slug);
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: Request, context: RouteContext) {
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
  await unpublishPost(slug);
  return NextResponse.json({ ok: true, slug });
}
