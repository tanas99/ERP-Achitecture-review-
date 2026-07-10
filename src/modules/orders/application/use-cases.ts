import { z } from "zod";
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { DomainError, NotFoundError } from "@/modules/shared/domain/errors";
import { ok, type Result } from "@/modules/shared/domain/result";
import type { OrderDetail } from "@/modules/orders/domain/types";
import type { OrderRepository, OrderableQuotationRepository } from "./ports";
import {
  createOrderFromQuotationSchema,
  registerPaymentSchema,
  setOrderStatusSchema,
  updateDeliverySchema,
  type OrderFilters,
} from "./forms";

function fieldErrors(e: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[i.path.join(".") || "_"] ||= i.message;
  return out;
}
function fail(e: z.ZodError, msg = "Datos inválidos.") {
  return { ok: false as const, error: new DomainError("VALIDATION", msg, fieldErrors(e)) };
}

export function makeCreateOrderFromQuotation(repo: OrderRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<{ id: string }, DomainError>> => {
    authorize(ctx, "orders:write");
    const p = createOrderFromQuotationSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    const id = await repo.createFromQuotation(ctx, p.data);
    return ok({ id });
  };
}

export function makeListOrders(repo: OrderRepository) {
  return (ctx: RequestContext, filters: OrderFilters) => {
    authorize(ctx, "orders:read");
    return repo.list(ctx, filters);
  };
}

export function makeGetOrder(repo: OrderRepository) {
  return async (ctx: RequestContext, orderId: string): Promise<OrderDetail> => {
    authorize(ctx, "orders:read");
    const o = await repo.findById(ctx, orderId);
    if (!o) throw new NotFoundError("Pedido no encontrado.");
    return o;
  };
}

export function makeRegisterPayment(repo: OrderRepository) {
  return async (
    ctx: RequestContext,
    orderId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "payments:write");
    const p = registerPaymentSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    await repo.registerPayment(ctx, orderId, p.data);
    return ok(null);
  };
}

export function makeSetOrderStatus(repo: OrderRepository) {
  return async (
    ctx: RequestContext,
    orderId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "orders:write");
    const p = setOrderStatusSchema.safeParse(input);
    if (!p.success) return fail(p.error, "Estado inválido.");
    await repo.setStatus(ctx, orderId, p.data.status as never, p.data.reason ?? null);
    return ok(null);
  };
}

export function makeUpdateDelivery(repo: OrderRepository) {
  return async (
    ctx: RequestContext,
    orderId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "orders:write");
    const p = updateDeliverySchema.safeParse(input);
    if (!p.success) return fail(p.error);
    await repo.updateDelivery(ctx, orderId, p.data);
    return ok(null);
  };
}

export function makeListOrderableQuotations(repo: OrderableQuotationRepository) {
  return (ctx: RequestContext) => {
    authorize(ctx, "orders:write");
    return repo.approvedWithoutOrder(ctx);
  };
}
