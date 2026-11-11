import { describe, expect, it } from "vitest";
import { isAllowedAffiliateUrl, parseAffiliateUrl } from "./affiliate-url";

describe("isAllowedAffiliateUrl", () => {
  it("allows meli.la short links", () => {
    expect(isAllowedAffiliateUrl("https://meli.la/1BHXJUZ")).toBe(true);
  });

  it("allows mercadolivre.com.br", () => {
    expect(isAllowedAffiliateUrl("https://www.mercadolivre.com.br/foo")).toBe(
      true,
    );
  });

  it("rejects other hosts", () => {
    expect(isAllowedAffiliateUrl("https://amazon.com.br/x")).toBe(false);
  });

  it("rejects non-https schemes", () => {
    expect(isAllowedAffiliateUrl("http://meli.la/1BHXJUZ")).toBe(false);
  });
});

describe("parseAffiliateUrl", () => {
  it("returns a URL for allowlisted hosts", () => {
    const url = parseAffiliateUrl("https://meli.la/1BHXJUZ");
    expect(url.hostname).toBe("meli.la");
  });

  it("throws for disallowed hosts", () => {
    expect(() => parseAffiliateUrl("https://amazon.com.br/x")).toThrow();
  });
});
