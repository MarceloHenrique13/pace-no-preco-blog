import { describe, expect, it } from "vitest";
import { allShoesHaveOverrides, isPostPublic } from "./publish";

describe("isPostPublic", () => {
  it("hides draft posts without publication", () => {
    expect(
      isPostPublic({ slug: "a", draft: true }, new Set()),
    ).toBe(false);
  });

  it("shows draft posts with publication row", () => {
    expect(
      isPostPublic({ slug: "a", draft: true }, new Set(["a"])),
    ).toBe(true);
  });

  it("grandfathers non-draft posts without publication row", () => {
    expect(
      isPostPublic({ slug: "a", draft: false }, new Set()),
    ).toBe(true);
  });
});

describe("allShoesHaveOverrides", () => {
  it("is false when any shoe is missing", () => {
    expect(allShoesHaveOverrides(["A", "B"], new Set(["A"]))).toBe(false);
  });

  it("is true when every shoe has an override", () => {
    expect(allShoesHaveOverrides(["A", "B"], new Set(["A", "B"]))).toBe(true);
  });

  it("is true when there are no shoes", () => {
    expect(allShoesHaveOverrides([], new Set())).toBe(true);
  });
});
