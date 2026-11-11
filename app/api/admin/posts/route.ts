import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-auth";
import {
  listAllOverrides,
  listPublishedSlugs,
} from "@/lib/affiliate-store";
import { getAllPosts } from "@/lib/content";
import { allShoesHaveOverrides, isPostPublic } from "@/lib/publish";

export async function GET(req: Request) {
  try {
    assertAdminRequest(req);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const [posts, publishedSlugs, overridesByPost] = await Promise.all([
    getAllPosts({ forAdmin: true }),
    listPublishedSlugs(),
    listAllOverrides(),
  ]);

  const payload = posts.map((post) => {
    const overrides = overridesByPost.get(post.slug) ?? new Map();
    const shoeNames = post.shoes.map((shoe) => shoe.name);
    const linksReady = allShoesHaveOverrides(
      shoeNames,
      new Set(overrides.keys()),
    );
    const isPublic = isPostPublic(post, publishedSlugs);

    return {
      slug: post.slug,
      title: post.title,
      draft: post.draft,
      shoeCount: post.shoes.length,
      overrideCount: overrides.size,
      linksReady,
      isPublic,
      publishedViaAdmin: publishedSlugs.has(post.slug),
    };
  });

  return NextResponse.json({ posts: payload });
}
