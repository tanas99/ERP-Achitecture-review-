import { describe, it, expect } from "vitest";
import {
  createLeadSchema,
  updateLeadSchema,
  addActivitySchema,
} from "./lead-forms";

describe("createLeadSchema", () => {
  it("requires a name", () => {
    expect(createLeadSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createLeadSchema.safeParse({ name: "Ana" }).success).toBe(true);
  });

  it("applies defaults for source and status", () => {
    const r = createLeadSchema.parse({ name: "Ana" });
    expect(r.source).toBe("OTRO");
    expect(r.status).toBe("NUEVO");
  });

  it("treats empty optional strings as undefined", () => {
    const r = createLeadSchema.parse({ name: "Ana", phone: "", email: "" });
    expect(r.phone).toBeUndefined();
    expect(r.email).toBeUndefined();
  });

  it("validates email format when present", () => {
    expect(createLeadSchema.safeParse({ name: "Ana", email: "nope" }).success).toBe(false);
    expect(
      createLeadSchema.safeParse({ name: "Ana", email: "ana@mail.com" }).success,
    ).toBe(true);
  });

  it("coerces nextFollowUpAt string to a Date", () => {
    const r = createLeadSchema.parse({ name: "Ana", nextFollowUpAt: "2026-08-01" });
    expect(r.nextFollowUpAt).toBeInstanceOf(Date);
  });

  it("rejects invalid source/status", () => {
    expect(createLeadSchema.safeParse({ name: "Ana", source: "X" }).success).toBe(false);
    expect(createLeadSchema.safeParse({ name: "Ana", status: "X" }).success).toBe(false);
  });
});

describe("updateLeadSchema", () => {
  it("allows partial updates", () => {
    expect(updateLeadSchema.safeParse({ status: "GANADO" }).success).toBe(true);
  });
  it("rejects an empty update", () => {
    expect(updateLeadSchema.safeParse({}).success).toBe(false);
  });
  it("accepts a lost reason", () => {
    const r = updateLeadSchema.parse({ status: "PERDIDO", lostReason: "PRECIO" });
    expect(r.lostReason).toBe("PRECIO");
  });
});

describe("addActivitySchema", () => {
  it("requires a summary and defaults type to NOTA", () => {
    expect(addActivitySchema.safeParse({ summary: "" }).success).toBe(false);
    const r = addActivitySchema.parse({ summary: "Llamé, contesta mañana" });
    expect(r.type).toBe("NOTA");
  });
  it("accepts a valid activity type", () => {
    const r = addActivitySchema.parse({ type: "WHATSAPP", summary: "Le escribí" });
    expect(r.type).toBe("WHATSAPP");
  });
});
