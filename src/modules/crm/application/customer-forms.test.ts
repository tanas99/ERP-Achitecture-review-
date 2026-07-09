import { describe, it, expect } from "vitest";
import {
  addAddressSchema,
  addNoteSchema,
  updateCustomerSchema,
} from "./customer-forms";

describe("addAddressSchema", () => {
  it("requires label and address", () => {
    expect(addAddressSchema.safeParse({ label: "", address: "" }).success).toBe(false);
    const r = addAddressSchema.parse({ label: "Casa", address: "Av. Siempre Viva 123" });
    expect(r.isDefault).toBe(false);
    expect(r.zone).toBeUndefined();
  });
  it("accepts optional zone/reference and isDefault", () => {
    const r = addAddressSchema.parse({
      label: "Oficina",
      address: "Edif. Torre 1",
      zone: "Urdesa",
      isDefault: true,
    });
    expect(r.zone).toBe("Urdesa");
    expect(r.isDefault).toBe(true);
  });
});

describe("addNoteSchema", () => {
  it("requires a non-empty body", () => {
    expect(addNoteSchema.safeParse({ body: "" }).success).toBe(false);
    expect(addNoteSchema.safeParse({ body: "Cliente frecuente" }).success).toBe(true);
  });
});

describe("updateCustomerSchema", () => {
  it("allows partial updates and validates email", () => {
    expect(updateCustomerSchema.safeParse({ phone: "0999" }).success).toBe(true);
    expect(updateCustomerSchema.safeParse({ email: "bad" }).success).toBe(false);
    expect(updateCustomerSchema.safeParse({}).success).toBe(false);
  });
  it("validates identification type", () => {
    expect(
      updateCustomerSchema.safeParse({ identificationType: "CEDULA" }).success,
    ).toBe(true);
    expect(
      updateCustomerSchema.safeParse({ identificationType: "X" }).success,
    ).toBe(false);
  });
});
