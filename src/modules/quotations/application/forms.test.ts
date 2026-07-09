import { describe, it, expect } from "vitest";
import { createQuotationSchema, parseQuotationFilters } from "./forms";

describe("createQuotationSchema", () => {
  const baseItem = { description: "Vintage cake", quantity: 1, unitPriceCents: 4000 };

  it("requires exactly one of lead/customer", () => {
    expect(createQuotationSchema.safeParse({ items: [baseItem] }).success).toBe(false);
    expect(
      createQuotationSchema.safeParse({ leadId: "l1", customerId: "c1", items: [baseItem] }).success,
    ).toBe(false);
    expect(createQuotationSchema.safeParse({ leadId: "l1", items: [baseItem] }).success).toBe(true);
    expect(createQuotationSchema.safeParse({ customerId: "c1", items: [baseItem] }).success).toBe(true);
  });

  it("requires at least one item with description", () => {
    expect(createQuotationSchema.safeParse({ leadId: "l1", items: [] }).success).toBe(false);
    expect(
      createQuotationSchema.safeParse({ leadId: "l1", items: [{ ...baseItem, description: "" }] }).success,
    ).toBe(false);
  });

  it("coerces item quantity and price", () => {
    const r = createQuotationSchema.parse({
      leadId: "l1",
      items: [{ description: "Cupcakes", quantity: "12", unitPriceCents: "150" }],
    });
    expect(r.items[0]!.quantity).toBe(12);
    expect(r.items[0]!.unitPriceCents).toBe(150);
    expect(r.taxCode).toBe("IVA_15"); // default code; effective rate comes from config (0 for RIMPE)
  });
});

describe("parseQuotationFilters", () => {
  it("defaults and validates status", () => {
    expect(parseQuotationFilters({}).page).toBe(1);
    expect(parseQuotationFilters({ status: "ENVIADA" }).status).toBe("ENVIADA");
    expect(() => parseQuotationFilters({ status: "NOPE" })).toThrow();
  });
});
