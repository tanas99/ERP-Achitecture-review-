import type { LeadFilters, CustomerFilters } from "@/modules/crm/application/filters";

/**
 * Pure translators from validated filters -> Prisma `where` objects.
 * Kept side-effect-free so they are unit-testable without a database.
 * Always tenant-scoped (companyId) and exclude soft-deleted rows.
 */
export type WhereClause = Record<string, unknown>;

export function buildLeadWhere(
  companyId: string,
  filters: LeadFilters,
): WhereClause {
  const where: WhereClause = { companyId, deletedAt: null };

  if (filters.status) where.status = filters.status;
  if (filters.source) where.source = filters.source;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { socialHandle: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

export function buildCustomerWhere(
  companyId: string,
  filters: CustomerFilters,
): WhereClause {
  const where: WhereClause = { companyId, deletedAt: null };

  if (filters.tagId) {
    where.tags = { some: { tagId: filters.tagId } };
  }

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { identification: { contains: q } },
    ];
  }
  return where;
}

/** Offset pagination params shared by both repositories. */
export function paginationArgs(page: number, pageSize: number) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
