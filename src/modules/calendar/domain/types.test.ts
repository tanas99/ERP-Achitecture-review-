import { describe, it, expect } from "vitest";
import { monthRange } from "./types";

describe("monthRange", () => {
  it("computes first day and next-month first day (UTC)", () => {
    const { from, to } = monthRange(2026, 7);
    expect(from.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("wraps December to next year", () => {
    const { from, to } = monthRange(2026, 12);
    expect(from.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});
