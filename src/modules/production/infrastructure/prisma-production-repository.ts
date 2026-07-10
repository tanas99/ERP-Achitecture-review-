import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import { assertSameTenant } from "@/server/tenant";
import { DomainError } from "@/modules/shared/domain/errors";
import type { ProductionRepository } from "@/modules/production/application/ports";
import type { AddTaskInput, ProductionFilters } from "@/modules/production/application/forms";
import type {
  OrderPriority,
  ProductionDetail,
  ProductionListItem,
  ProductionStatus,
  ProductionTaskStatus,
  ProductionTaskType,
} from "@/modules/production/domain/types";

export class PrismaProductionRepository implements ProductionRepository {
  async list(
    ctx: RequestContext,
    filters: ProductionFilters,
  ): Promise<ProductionListItem[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters.status) where.status = filters.status;
    else if (!filters.includeFinished) where.status = { not: "FINALIZADO" };

    const rows = await db.productionOrder.findMany({
      where,
      include: {
        tasks: { select: { status: true } },
        order: {
          select: { number: true, customerNameSnapshot: true, priority: true, dueDate: true },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    const filtered = filters.q
      ? rows.filter(
          (r) =>
            String(r.order.number) === filters.q ||
            r.order.customerNameSnapshot.toLowerCase().includes(filters.q!.toLowerCase()),
        )
      : rows;

    return filtered.map((r) => ({
      id: r.id,
      orderNumber: r.order.number,
      customerName: r.order.customerNameSnapshot,
      status: r.status as ProductionStatus,
      priority: r.order.priority as OrderPriority,
      dueDate: r.order.dueDate,
      tasksDone: r.tasks.filter((t) => t.status === "FINALIZADO").length,
      tasksTotal: r.tasks.length,
    }));
  }

  async findById(
    ctx: RequestContext,
    productionOrderId: string,
  ): Promise<ProductionDetail | null> {
    const p = await db.productionOrder.findFirst({
      where: { id: productionOrderId, companyId: ctx.companyId },
      include: {
        tasks: { orderBy: { displayOrder: "asc" } },
        order: { include: { items: true } },
      },
    });
    if (!p) return null;
    return {
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order.number,
      customerName: p.order.customerNameSnapshot,
      status: p.status as ProductionStatus,
      priority: p.order.priority as OrderPriority,
      dueDate: p.order.dueDate,
      notes: p.notes,
      items: p.order.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
      })),
      tasks: p.tasks.map((t) => ({
        id: t.id,
        type: t.type as ProductionTaskType,
        name: t.name,
        status: t.status as ProductionTaskStatus,
        sequence: t.sequence,
        displayOrder: t.displayOrder,
      })),
    };
  }

  async setStatus(
    ctx: RequestContext,
    productionOrderId: string,
    status: ProductionStatus,
  ): Promise<void> {
    const p = await db.productionOrder.findFirst({
      where: { id: productionOrderId, companyId: ctx.companyId },
      select: { id: true, status: true, startedAt: true },
    });
    if (!p) throw new DomainError("NOT_FOUND", "Orden de producción no encontrada.");
    const now = new Date();
    await db.$transaction([
      db.productionOrder.update({
        where: { id: productionOrderId },
        data: {
          status,
          startedAt: p.startedAt ?? (status !== "PENDIENTE" ? now : null),
          finishedAt: status === "FINALIZADO" ? now : null,
        },
      }),
      db.productionStatusHistory.create({
        data: {
          productionOrderId,
          fromStatus: p.status,
          toStatus: status,
          changedById: ctx.userId,
        },
      }),
    ]);
  }

  async addTask(
    ctx: RequestContext,
    productionOrderId: string,
    input: AddTaskInput,
  ): Promise<void> {
    const p = await db.productionOrder.findFirst({
      where: { id: productionOrderId, companyId: ctx.companyId },
      select: { id: true },
    });
    if (!p) throw new DomainError("NOT_FOUND", "Orden de producción no encontrada.");
    const last = await db.productionTask.findFirst({
      where: { productionOrderId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    const order = (last?.displayOrder ?? 0) + 1;
    await db.productionTask.create({
      data: {
        companyId: ctx.companyId,
        productionOrderId,
        type: input.type as ProductionTaskType,
        name: input.name,
        sequence: order,
        displayOrder: order,
      },
    });
  }

  async setTaskStatus(
    ctx: RequestContext,
    taskId: string,
    status: ProductionTaskStatus,
  ): Promise<void> {
    const task = await db.productionTask.findUnique({
      where: { id: taskId },
      select: { companyId: true, startedAt: true },
    });
    assertSameTenant(ctx, task);
    const now = new Date();
    await db.productionTask.update({
      where: { id: taskId },
      data: {
        status,
        startedAt: task!.startedAt ?? (status === "EN_PROGRESO" ? now : task!.startedAt),
        finishedAt: status === "FINALIZADO" ? now : null,
      },
    });
  }

  async removeTask(ctx: RequestContext, taskId: string): Promise<void> {
    const task = await db.productionTask.findUnique({
      where: { id: taskId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, task);
    await db.productionTask.delete({ where: { id: taskId } });
  }
}
