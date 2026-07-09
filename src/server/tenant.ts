import type { RequestContext } from "@/server/context";

/**
 * Tenant guard (ARCHITECTURE.md §4). Every tenant-scoped query must be filtered
 * by the caller's companyId. Repositories build their `where` clause through
 * this helper so single-tenant today becomes multi-company/RLS later with no
 * call-site changes.
 */
export function tenantWhere(
  ctx: Pick<RequestContext, "companyId">,
): { companyId: string } {
  return { companyId: ctx.companyId };
}

/** Guard an entity fetched by id belongs to the caller's company. */
export function assertSameTenant(
  ctx: Pick<RequestContext, "companyId">,
  entity: { companyId: string } | null,
): void {
  if (!entity || entity.companyId !== ctx.companyId) {
    // Do not leak existence across tenants.
    throw new Error("Recurso no encontrado.");
  }
}
