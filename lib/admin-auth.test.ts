import { afterEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifyAdminPassword,
  verifySessionToken,
} from "./admin-auth";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("admin-auth", () => {
  it("round-trips a session token", () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-value";
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
    expect(verifySessionToken("bad.token")).toBe(false);
  });

  it("compares admin password", () => {
    process.env.ADMIN_PASSWORD = "senha-forte";
    expect(verifyAdminPassword("senha-forte")).toBe(true);
    expect(verifyAdminPassword("outra")).toBe(false);
  });
});
