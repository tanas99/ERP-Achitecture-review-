import { z } from "zod";
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { DomainError, NotFoundError } from "@/modules/shared/domain/errors";
import { ok, type Result } from "@/modules/shared/domain/result";
import { QUOTATION_STATUSES } from "@/modules/quotations/domain/types";
import type { QuotationDetail } from "@/modules/quotations/domain/types";
import type {
  QuotationRepository,
  QuotationDirectoryRepository,
} from "./ports";
import { createQuotationSchema, type QuotationFilters } from "./forms";

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[i.path.join(".") || "_"] ||= i.message;
  return out;
}

export function makeCreateQuotation(repo: QuotationRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<{ id: string }, DomainError>> => {
    authorize(ctx, "quotations:write");
    const parsed = createQuotationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    const id = await repo.create(ctx, parsed.data);
    return ok({ id });
  };
}

export function makeListQuotations(repo: QuotationRepository) {
  return (ctx: RequestContext, filters: QuotationFilters) => {
    authorize(ctx, "quotations:read");
    return repo.list(ctx, filters);
  };
}

export function makeGetQuotation(repo: QuotationRepository) {
  return async (
    ctx: RequestContext,
    quotationId: string,
  ): Promise<QuotationDetail> => {
    authorize(ctx, "quotations:read");
    const q = await repo.findById(ctx, quotationId);
    if (!q) throw new NotFoundError("Cotización no encontrada.");
    return q;
  };
}

const setStatusSchema = z.object({
  quotationId: z.string().min(1),
  // Accept/convert is handled in a later milestone; here we allow non-approving moves.
  status: z.enum(["ENVIADA", "RECHAZADA", "PERDIDA", "BORRADOR"] as [string, ...string[]]),
});

export function makeSetQuotationStatus(repo: QuotationRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "quotations:write");
    const parsed = setStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: new DomainError("VALIDATION", "Estado inválido.") };
    }
    await repo.setStatus(
      ctx,
      parsed.data.quotationId,
      parsed.data.status as (typeof QUOTATION_STATUSES)[number],
    );
    return ok(null);
  };
}

/**
 * Accept a quotation. Business rule (docs/flujo-conversion-lead-cliente.md):
 * accepting a quotation converts its Lead into a Customer (if not already), then
 * links the quotation to that customer. `convertLead` is the CRM public API.
 */
export function makeAcceptQuotation(
  repo: QuotationRepository,
  convertLead: (
    ctx: RequestContext,
    leadId: string,
  ) => Promise<Result<{ customerId: string }, DomainError>>,
) {
  return async (
    ctx: RequestContext,
    quotationId: string,
  ): Promise<Result<{ customerId: string | null }, DomainError>> => {
    authorize(ctx, "quotations:write");
    const q = await repo.findById(ctx, quotationId);
    if (!q) return { ok: false, error: new NotFoundError("Cotización no encontrada.") };
    if (q.status === "APROBADA") return ok({ customerId: q.customerId });

    let customerId = q.customerId;
    if (!customerId) {
      if (!q.leadId) {
        return {
          ok: false,
          error: new DomainError("DOMAIN_RULE", "La cotización no tiene lead ni cliente."),
        };
      }
      const conv = await convertLead(ctx, q.leadId);
      if (!conv.ok) return conv;
      customerId = conv.data.customerId;
    }
    await repo.accept(ctx, quotationId, customerId);
    return ok({ customerId });
  };
}

export function makeListQuotationParties(repo: QuotationDirectoryRepository) {
  return async (ctx: RequestContext) => {
    authorize(ctx, "quotations:read");
    const [leads, customers] = await Promise.all([
      repo.leadOptions(ctx),
      repo.customerOptions(ctx),
    ]);
    return { leads, customers };
  };
}
