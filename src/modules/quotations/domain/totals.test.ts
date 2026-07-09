import { describe, it, expect } from "vitest";
import { computeQuotationTotals } from "./totals";

describe("computeQuotationTotals", () => {
  it("computes line totals and subtotal in cents", () => {
    const t = computeQuotationTotals(
      [
        { quantity: 2, unitPriceCents: 1500 }, // 30.00
        { quantity: 1, unitPriceCents: 4000 }, // 40.00
      ],
      0,
    );
    expect(t.lines[0]!.lineTotalCents).toBe(3000);
    expect(t.subtotalCents).toBe(7000);
  });

  it("RIMPE Negocio Popular: 0% tax means total equals subtotal", () => {
    const t = computeQuotationTotals([{ quantity: 3, unitPriceCents: 2000 }], 0);
    expect(t.taxCents).toBe(0);
    expect(t.totalCents).toBe(6000);
    expect(t.totalCents).toBe(t.subtotalCents);
  });

  it("still supports a configured tax rate (e.g. future 15%)", () => {
    const t = computeQuotationTotals([{ quantity: 1, unitPriceCents: 10000 }], 15);
    expect(t.taxCents).toBe(1500);
    expect(t.totalCents).toBe(11500);
  });

  it("rounds tax to the nearest cent", () => {
    const t = computeQuotationTotals([{ quantity: 1, unitPriceCents: 333 }], 15);
    expect(t.taxCents).toBe(50); // 49.95 -> 50
  });
});
