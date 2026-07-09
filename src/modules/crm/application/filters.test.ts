import { describe, it, expect } from "vitest";
import { parseLeadFilters, parseCustomerFilters } from "./filters";

describe("CRM filter parsing", () => {
  it("applies defaults for empty input", () => {
    const f = parseLeadFilters({});
    expect(f.page).toBe(1);
    expect(f.pageSize).toBe(20);
    expect(f.q).toBeUndefined();
  });

  it("coerces page/pageSize from strings (URL params)", () => {
    const f = parseLeadFilters({ page: "3", pageSize: "50" });
    expect(f.page).toBe(3);
    expect(f.pageSize).toBe(50);
  });

  it("caps pageSize at 100", () => {
    expect(() => parseLeadFilters({ pageSize: "500" })).toThrow();
  });

  it("accepts valid status/source and rejects invalid", () => {
    expect(parseLeadFilters({ status: "GANADO" }).status).toBe("GANADO");
    expect(parseLeadFilters({ source: "INSTAGRAM" }).source).toBe("INSTAGRAM");
    expect(() => parseLeadFilters({ status: "NO_EXISTE" })).toThrow();
  });

  it("trims the search query and strips unknown keys", () => {
    const f = parseLeadFilters({ q: "  Ana  ", hacker: "x" });
    expect(f.q).toBe("Ana");
    expect((f as Record<string, unknown>).hacker).toBeUndefined();
  });

  it("parses customer filters with tag", () => {
    const f = parseCustomerFilters({ q: "Maria", tagId: "tag_1" });
    expect(f.q).toBe("Maria");
    expect(f.tagId).toBe("tag_1");
  });
});
