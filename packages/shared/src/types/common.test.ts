import { describe, it, expectTypeOf } from "vitest";
import type { Timestamp } from "./common";

describe("Timestamp type", () => {
  it("has seconds and nanoseconds fields", () => {
    expectTypeOf<Timestamp>().toHaveProperty("seconds");
    expectTypeOf<Timestamp>().toHaveProperty("nanoseconds");
  });

  it("accepts valid timestamp objects", () => {
    const ts: Timestamp = { seconds: 1700000000, nanoseconds: 0 };
    expectTypeOf(ts.seconds).toBeNumber();
    expectTypeOf(ts.nanoseconds).toBeNumber();
  });
});
