import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!verifyAdminPassword(body.password ?? "")) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  try {
    const token = createSessionToken();
    const response = NextResponse.json({ ok: true });
    const cookie = adminCookieOptions(token);
    response.cookies.set(cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "auth_misconfigured" }, { status: 503 });
  }
}
