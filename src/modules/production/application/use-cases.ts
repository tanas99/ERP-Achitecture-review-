import { z } from "zod";
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { DomainError, NotFoundError } from "@/modules/shared/domain/errors";
import { ok, type Result } from "@/modules/shared/domain/result";
import type { ProductionDetail } from "@/modules/production/domain/types";
import type { ProductionRepository } from "./ports";
import {
  addTaskSchema,
  setProductionStatusSchema,
  setTaskStatusSchema,
  type ProductionFilters,
} from "./forms";

function invalid() {
  return { ok: false as const, error: new DomainError("VALIDATION", "Datos inválidos.") };
}

export function makeListProduction(repo: ProductionRepository) {
  return (ctx: RequestContext, filters: ProductionFilters) => {
    authorize(ctx, "production:read");
    return repo.list(ctx, filters);
  };
}

export function makeGetProduction(repo: ProductionRepository) {
  return async (ctx: RequestContext, id: string): Promise<ProductionDetail> => {
    authorize(ctx, "production:read");
    const p = await repo.findById(ctx, id);
    if (!p) throw new NotFoundError("Orden de producción no encontrada.");
    return p;
  };
}

export function makeSetProductionStatus(repo: ProductionRepository) {
  return async (ctx: RequestContext, id: string, input: unknown): Promise<Result<null, DomainError>> => {
    authorize(ctx, "production:update-status");
    const p = setProductionStatusSchema.safeParse(input);
    if (!p.success) return invalid();
    await repo.setStatus(ctx, id, p.data.status as never);
    return ok(null);
  };
}

export function makeAddProductionTask(repo: ProductionRepository) {
  return async (ctx: RequestContext, id: string, input: unknown): Promise<Result<null, DomainError>> => {
    authorize(ctx, "production:update-status");
    const p = addTaskSchema.safeParse(input);
    if (!p.success) return invalid();
    await repo.addTask(ctx, id, p.data);
    return ok(null);
  };
}

export function makeSetTaskStatus(repo: ProductionRepository) {
  return async (ctx: RequestContext, input: unknown): Promise<Result<null, DomainError>> => {
    authorize(ctx, "production:update-status");
    const p = setTaskStatusSchema.safeParse(input);
    if (!p.success) return invalid();
    await repo.setTaskStatus(ctx, p.data.taskId, p.data.status as never);
    return ok(null);
  };
}

export function makeRemoveProductionTask(repo: ProductionRepository) {
  return async (ctx: RequestContext, taskId: string): Promise<Result<null, DomainError>> => {
    authorize(ctx, "production:update-status");
    await repo.removeTask(ctx, taskId);
    return ok(null);
  };
}
