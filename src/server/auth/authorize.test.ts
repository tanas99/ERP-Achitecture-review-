import { describe, it, expect } from "vitest";
import { can, authorize } from "./authorize";
import { UnauthorizedError } from "@/modules/shared/domain/errors";

describe("RBAC authorize", () => {
  it("grants Administrador every capability", () => {
    const ctx = { roles: ["ADMINISTRADOR"] as const };
    expect(can(ctx, "orders:write")).toBe(true);
    expect(can(ctx, "users:manage")).toBe(true);
    expect(can(ctx, "settings:manage")).toBe(true);
  });

  it("lets Ventas write orders but not manage users", () => {
    const ctx = { roles: ["VENTAS"] as const };
    expect(can(ctx, "orders:write")).toBe(true);
    expect(can(ctx, "quotations:write")).toBe(true);
    expect(can(ctx, "users:manage")).toBe(false);
    expect(can(ctx, "production:update-status")).toBe(false);
  });

  it("restricts Produccion to production capabilities", () => {
    const ctx = { roles: ["PRODUCCION"] as const };
    expect(can(ctx, "production:update-status")).toBe(true);
    expect(can(ctx, "orders:read")).toBe(true);
    expect(can(ctx, "orders:write")).toBe(false);
    expect(can(ctx, "delivery:update")).toBe(false);
  });

  it("restricts Repartidor to delivery capabilities", () => {
    const ctx = { roles: ["REPARTIDOR"] as const };
    expect(can(ctx, "delivery:update")).toBe(true);
    expect(can(ctx, "orders:write")).toBe(false);
  });

  it("combines capabilities across multiple roles", () => {
    const ctx = { roles: ["PRODUCCION", "REPARTIDOR"] as const };
    expect(can(ctx, "production:update-status")).toBe(true);
    expect(can(ctx, "delivery:update")).toBe(true);
    expect(can(ctx, "orders:write")).toBe(false);
  });

  it("authorize throws UnauthorizedError when capability is missing", () => {
    const ctx = { roles: ["REPARTIDOR"] as const };
    expect(() => authorize(ctx, "orders:write")).toThrow(UnauthorizedError);
    expect(() => authorize(ctx, "delivery:update")).not.toThrow();
  });
});
