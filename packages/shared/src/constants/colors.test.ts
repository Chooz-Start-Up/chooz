import { describe, it, expect } from "vitest";
import { colors } from "./colors";

describe("colors", () => {
  it("exports primary brand colors", () => {
    expect(colors.primary.main).toBe("#D11D27");
    expect(colors.primary.dark).toBe("#A90011");
    expect(colors.primary.light).toBe("#E53C38");
  });

  it("exports secondary palette", () => {
    expect(colors.secondary.main).toBe("#FFFAEF");
  });

  it("exports semantic colors", () => {
    expect(colors.success).toBeDefined();
    expect(colors.warning).toBeDefined();
    expect(colors.error).toBeDefined();
    expect(colors.info).toBeDefined();
  });
});
