import { describe, it, expect } from "vitest";
import {
  buildLeadWhere,
  buildCustomerWhere,
  paginationArgs,
} from "./where-builders";
import { parseLeadFilters, parseCustomerFilters } from "../application/filters";

describe("buildLeadWhere", () => {
  it("always scopes by company and excludes soft-deleted", () => {
    const where = buildLeadWhere("c1", parseLeadFilters({}));
    expect(where.companyId).toBe("c1");
    expect(where.deletedAt).toBeNull();
    expect(where.OR).toBeUndefined();
  });

  it("maps status/source/assignee filters", () => {
    const where = buildLeadWhere(
      "c1",
      parseLeadFilters({ status: "COTIZADO", source: "WHATSAPP", assignedToId: "u1" }),
    );
    expect(where.status).toBe("COTIZADO");
    expect(where.source).toBe("WHATSAPP");
    expect(where.assignedToId).toBe("u1");
  });

  it("builds a case-insensitive OR search across fields", () => {
    const where = buildLeadWhere("c1", parseLeadFilters({ q: "ana" }));
    expect(Array.isArray(where.OR)).toBe(true);
    expect((where.OR as unknown[]).length).toBe(4);
  });
});

describe("buildCustomerWhere", () => {
  it("filters by tag via relation", () => {
    const where = buildCustomerWhere("c1", parseCustomerFilters({ tagId: "t1" }));
    expect(where.tags).toEqual({ some: { tagId: "t1" } });
  });

  it("searches name/phone/email/identification", () => {
    const where = buildCustomerWhere("c1", parseCustomerFilters({ q: "123" }));
    expect((where.OR as unknown[]).length).toBe(4);
  });
});

describe("paginationArgs", () => {
  it("computes skip/take", () => {
    expect(paginationArgs(1, 20)).toEqual({ skip: 0, take: 20 });
    expect(paginationArgs(3, 20)).toEqual({ skip: 40, take: 20 });
  });
});
