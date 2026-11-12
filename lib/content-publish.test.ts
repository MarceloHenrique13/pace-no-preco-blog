import { describe, expect, it } from "vitest";
import { applyAffiliateOverrides, applyImageOverrides } from "./content";
import type { Post } from "./schema";

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

describe("applyImageOverrides", () => {
  const post = {
    title: "T",
    slug: "t",
    description: "d",
    publishedAt: new Date("2026-11-12"),
    category: "tenis",
    tags: [],
    coverImage: "/cover-mdx.jpg",
    shoes: [
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
    ],
    faq: [],
    affiliateDisclosure: true,
    draft: true,
    content: "",
    readingTime: "1 min",
  } satisfies Post;

  it("overrides cover and matching shoe images", () => {
    const result = applyImageOverrides(post, {
      coverImage: "https://blob.example/cover.jpg",
      shoes: new Map([["A", "https://blob.example/a.jpg"]]),
    });
    expect(result.coverImage).toBe("https://blob.example/cover.jpg");
    expect(result.shoes[0].image).toBe("https://blob.example/a.jpg");
  });

  it("keeps MDX when overrides are empty", () => {
    const result = applyImageOverrides(post, {
      coverImage: null,
      shoes: new Map(),
    });
    expect(result.coverImage).toBe("/cover-mdx.jpg");
    expect(result.shoes[0].image).toBe("/a.jpg");
  });
});
