import { describe, expect, it } from "vitest";
import { allShoesHaveOverrides } from "./publish";

describe("post-publish link integrity", () => {
  it("detects incomplete overrides after a clear", () => {
    const shoes = ["A", "B", "C"];
    const afterClear = new Set(["A", "C"]);
    expect(allShoesHaveOverrides(shoes, afterClear)).toBe(false);
  });
});
