import { describe, expect, it } from "vitest";
import { isAllowedImageUrl } from "./image-url";

describe("isAllowedImageUrl", () => {
  it("accepts site-relative paths", () => {
    expect(isAllowedImageUrl("/images/posts/capa.jpg")).toBe(true);
  });

  it("accepts https blob URLs", () => {
    expect(
      isAllowedImageUrl(
        "https://abc.public.blob.vercel-storage.com/posts/shoe.jpg",
      ),
    ).toBe(true);
  });

  it("rejects empty and protocol-relative values", () => {
    expect(isAllowedImageUrl("")).toBe(false);
    expect(isAllowedImageUrl("//evil.example/x.jpg")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
  });
});
