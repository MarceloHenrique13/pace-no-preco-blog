import { describe, expect, it } from "vitest";
import { applyAffiliateOverrides } from "./content";

describe("applyAffiliateOverrides", () => {
  const shoes = [
    {
      rank: 1,
      name: "A",
      brand: "X",
      affiliateUrl: "https://www.mercadolivre.com.br/a",
      image: "/a.jpg",
      pros: [],
      cons: [],
      bestFor: "x",
    },
    {
      rank: 2,
      name: "B",
      brand: "Y",
      affiliateUrl: "https://www.mercadolivre.com.br/b",
      image: "/b.jpg",
      pros: [],
      cons: [],
      bestFor: "y",
    },
  ];

  it("replaces only matching shoe names", () => {
    const map = new Map([["A", "https://meli.la/1BHXJUZ"]]);
    const result = applyAffiliateOverrides(shoes, map);
    expect(result[0].affiliateUrl).toBe("https://meli.la/1BHXJUZ");
    expect(result[1].affiliateUrl).toBe("https://www.mercadolivre.com.br/b");
  });

  it("returns original shoes when map is empty", () => {
    const result = applyAffiliateOverrides(shoes, new Map());
    expect(result[0].affiliateUrl).toBe(shoes[0].affiliateUrl);
  });
});
