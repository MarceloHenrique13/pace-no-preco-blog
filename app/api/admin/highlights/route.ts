import { NextResponse } from "next/server";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-auth";
import { isAllowedAffiliateUrl } from "@/lib/affiliate-url";
import {
  getWeeklyHighlightsFromStore,
  saveWeeklyHighlights,
} from "@/lib/affiliate-store";
import { getWeeklyHighlights } from "@/lib/content";
import { getSql } from "@/lib/db";
import { weeklyHighlightsSchema } from "@/lib/schema";

export async function GET(req: Request) {
  try {
    assertAdminRequest(req);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const data = await getWeeklyHighlights();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = weeklyHighlightsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  for (const shoe of parsed.data.shoes) {
    if (!isAllowedAffiliateUrl(shoe.affiliateUrl)) {
      return NextResponse.json(
        { error: "invalid_affiliate_url", shoe: shoe.name },
        { status: 400 },
      );
    }
  }

  await saveWeeklyHighlights(parsed.data);
  const stored = await getWeeklyHighlightsFromStore();
  return NextResponse.json(stored ?? parsed.data);
}
