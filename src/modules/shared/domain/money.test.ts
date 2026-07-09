import { describe, it, expect } from "vitest";
import { Money } from "./money";

describe("Money", () => {
  it("stores integer cents and rejects fractional cents", () => {
    expect(Money.fromCents(1000).cents).toBe(1000);
    expect(() => Money.fromCents(10.5)).toThrow();
  });

  it("parses decimal amounts to cents with rounding", () => {
    expect(Money.fromAmount(12.5).cents).toBe(1250);
    expect(Money.fromAmount(0.1 + 0.2).cents).toBe(30); // no float drift
  });

  it("adds and subtracts without rounding errors", () => {
    const total = Money.fromCents(1000).add(Money.fromCents(2050));
    expect(total.cents).toBe(3050);
    expect(total.subtract(Money.fromCents(50)).cents).toBe(3000);
  });

  it("computes a 50% deposit and 15% IVA correctly", () => {
    const total = Money.fromCents(4000);
    expect(total.percentage(50).cents).toBe(2000); // 50% deposit
    expect(total.percentage(15).cents).toBe(600); // 15% IVA
  });

  it("multiplies unit price by whole quantity", () => {
    expect(Money.fromCents(1500).multiply(3).cents).toBe(4500);
    expect(() => Money.fromCents(1500).multiply(1.5)).toThrow();
  });

  it("detects negative balances", () => {
    expect(Money.fromCents(1000).subtract(Money.fromCents(1500)).isNegative()).toBe(true);
    expect(Money.zero().isZero()).toBe(true);
  });

  it("formats as USD for es-EC", () => {
    expect(Money.fromCents(1000).format()).toContain("10");
  });
});
