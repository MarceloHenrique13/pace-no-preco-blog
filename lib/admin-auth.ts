import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "pace_admin_session";

function getSecrets() {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  return { password, secret };
}

export function createSessionToken(): string {
  const { secret } = getSecrets();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurada");

  const payload = `admin:${Date.now()}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const { secret } = getSecrets();
  if (!secret || !token.includes(".")) return false;

  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminPassword(candidate: string): boolean {
  const { password } = getSecrets();
  if (!password) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function hasAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function assertAdminRequest(req: Request): void {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`));

  const token = match?.slice(ADMIN_COOKIE.length + 1);
  if (!token || !verifySessionToken(decodeURIComponent(token))) {
    throw new AdminAuthError();
  }
}

export class AdminAuthError extends Error {
  status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "AdminAuthError";
  }
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
