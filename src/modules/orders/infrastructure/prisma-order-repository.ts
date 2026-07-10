import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import { assertSameTenant } from "@/server/tenant";
import { DomainError } from "@/modules/shared/domain/errors";
import type {
  OrderRepository,
  OrderableQuotationRepository,
  Paginated,
} from "@/modules/orders/application/ports";
import type {
  CreateOrderFromQuotationInput,
  OrderFilters,
  RegisterPaymentInput,
  UpdateDeliveryInput,
} from "@/modules/orders/application/forms";
import type {
  DeliveryStatus,
  DeliveryType,
  EventType,
  OrderDetail,
  OrderListItem,
  OrderPriority,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTier,
} from "@/modules/orders/domain/types";
import { computePaymentSummary } from "@/modules/orders/domain/payments";

export class PrismaOrderRepository implements OrderRepository {
  async createFromQuotation(
    ctx: RequestContext,
    input: CreateOrderFromQuotationInput,
  ): Promise<string> {
    const quote = await db.quotation.findFirst({
      where: { id: input.quotationId, companyId: ctx.companyId, deletedAt: null },
      include: { items: true, customer: true, order: { select: { id: true } } },
    });
    assertSameTenant(ctx, quote);
    if (quote!.status !== "APROBADA")
      throw new DomainError("DOMAIN_RULE", "Solo se puede crear un pedido de una cotización aprobada.");
    if (!quote!.customerId || !quote!.customer)
      throw new DomainError("DOMAIN_RULE", "La cotización no tiene cliente.");
    if (quote!.order)
      throw new DomainError("CONFLICT", "Esta cotización ya tiene un pedido.");

    const c = quote!.customer;
    return db.$transaction(async (tx) => {
      const last = await tx.order.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const number = (last?.number ?? 0) + 1;

      const order = await tx.order.create({
        data: {
          companyId: ctx.companyId,
          customerId: quote!.customerId,
          quotationId: quote!.id,
          number,
          status: "ESPERANDO_ANTICIPO",
          priority: input.priority as OrderPriority,
          paymentStatus: "SIN_PAGO",
          customerNameSnapshot: c.name,
          customerPhoneSnapshot: c.phone,
          customerEmailSnapshot: c.email,
          customerIdentificationSnapshot: c.identification,
          customerIdTypeSnapshot: c.identificationType,
          eventType: (input.eventType as EventType | undefined) ?? null,
          eventName: input.eventName ?? null,
          eventDate: input.eventDate ?? null,
          eventTime: input.eventTime ?? null,
          subtotalCents: quote!.subtotalCents,
          taxCents: quote!.taxCents,
          totalCents: quote!.totalCents,
          paidCents: 0,
          balanceCents: quote!.totalCents,
          dueDate: input.dueDate ?? null,
          notes: input.notes ?? null,
          createdById: ctx.userId,
          items: {
            create: quote!.items.map((it) => ({
              productId: it.productId,
              description: it.description,
              quantity: it.quantity,
              unitPriceCents: it.unitPriceCents,
              lineTotalCents: it.lineTotalCents,
            })),
          },
          statusHistory: {
            create: { toStatus: "ESPERANDO_ANTICIPO", changedById: ctx.userId },
          },
        },
        select: { id: true },
      });

      await tx.customerTimelineEntry.create({
        data: {
          companyId: ctx.companyId,
          customerId: quote!.customerId,
          type: "PEDIDO",
          title: `Pedido #${number} creado`,
          createdById: ctx.userId,
        },
      });
      return order.id;
    });
  }

  async list(ctx: RequestContext, filters: OrderFilters): Promise<Paginated<OrderListItem>> {
    const where: Record<string, unknown> = { companyId: ctx.companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.q) {
      const asNum = Number(filters.q);
      where.OR = [
        ...(Number.isInteger(asNum) ? [{ number: asNum }] : []),
        { customerNameSnapshot: { contains: filters.q, mode: "insensitive" } },
      ];
    }
    const skip = (filters.page - 1) * filters.pageSize;
    const [rows, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: filters.pageSize,
      }),
      db.order.count({ where }),
    ]);
    const items: OrderListItem[] = rows.map((r) => ({
      id: r.id,
      number: r.number,
      status: r.status as OrderStatus,
      priority: r.priority as OrderPriority,
      paymentStatus: r.paymentStatus as PaymentStatus,
      customerName: r.customerNameSnapshot,
      totalCents: r.totalCents,
      balanceCents: r.balanceCents,
      dueDate: r.dueDate,
      createdAt: r.createdAt,
    }));
    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async findById(ctx: RequestContext, orderId: string): Promise<OrderDetail | null> {
    const o = await db.order.findFirst({
      where: { id: orderId, companyId: ctx.companyId, deletedAt: null },
      include: {
        items: true,
        payments: { orderBy: { paidAt: "desc" } },
        delivery: true,
        productionOrder: { select: { id: true } },
      },
    });
    if (!o) return null;
    return {
      id: o.id,
      number: o.number,
      status: o.status as OrderStatus,
      priority: o.priority as OrderPriority,
      paymentStatus: o.paymentStatus as PaymentStatus,
      customerId: o.customerId,
      customerName: o.customerNameSnapshot,
      customerPhone: o.customerPhoneSnapshot,
      customerEmail: o.customerEmailSnapshot,
      customerIdentification: o.customerIdentificationSnapshot,
      eventType: (o.eventType as EventType | null) ?? null,
      eventName: o.eventName,
      eventDate: o.eventDate,
      eventTime: o.eventTime,
      subtotalCents: o.subtotalCents,
      taxCents: o.taxCents,
      totalCents: o.totalCents,
      paidCents: o.paidCents,
      balanceCents: o.balanceCents,
      dueDate: o.dueDate,
      notes: o.notes,
      createdAt: o.createdAt,
      items: o.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
        lineTotalCents: it.lineTotalCents,
      })),
      payments: o.payments.map((p) => ({
        id: p.id,
        tier: p.tier as PaymentTier,
        method: p.method as PaymentMethod,
        amountCents: p.amountCents,
        reference: p.reference,
        paidAt: p.paidAt,
        confirmedAt: p.confirmedAt,
      })),
      delivery: o.delivery
        ? {
            type: o.delivery.type as DeliveryType,
            status: o.delivery.status as DeliveryStatus,
            address: o.delivery.address,
            zone: o.delivery.zone,
            feeCents: o.delivery.feeCents,
            courierName: o.delivery.courierName,
            scheduledAt: o.delivery.scheduledAt,
            deliveredAt: o.delivery.deliveredAt,
          }
        : null,
      hasProductionOrder: Boolean(o.productionOrder),
    };
  }

  async registerPayment(
    ctx: RequestContext,
    orderId: string,
    input: RegisterPaymentInput,
  ): Promise<void> {
    const order = await db.order.findFirst({
      where: { id: orderId, companyId: ctx.companyId },
      select: { id: true, totalCents: true, customerId: true },
    });
    assertSameTenant(ctx, order ? { companyId: ctx.companyId } : null);
    if (!order) throw new DomainError("NOT_FOUND", "Pedido no encontrado.");

    await db.$transaction(async (tx) => {
      const now = new Date();
      await tx.payment.create({
        data: {
          orderId,
          tier: input.tier as PaymentTier,
          method: input.method as PaymentMethod,
          amountCents: input.amountCents,
          reference: input.reference ?? null,
          paidAt: now,
          confirmedById: ctx.userId,
          confirmedAt: now,
          createdById: ctx.userId,
        },
      });
      const confirmed = await tx.payment.findMany({
        where: { orderId, confirmedAt: { not: null } },
        select: { amountCents: true },
      });
      const summary = computePaymentSummary(order.totalCents, confirmed);
      await tx.order.update({
        where: { id: orderId },
        data: {
          paidCents: summary.paidCents,
          balanceCents: summary.balanceCents,
          paymentStatus: summary.paymentStatus,
        },
      });
      if (order.customerId) {
        await tx.customerTimelineEntry.create({
          data: {
            companyId: ctx.companyId,
            customerId: order.customerId,
            type: "PAGO",
            title: `Pago registrado: ${(input.amountCents / 100).toFixed(2)} USD`,
            createdById: ctx.userId,
          },
        });
      }
    });
  }

  async setStatus(
    ctx: RequestContext,
    orderId: string,
    status: OrderStatus,
    reason: string | null,
  ): Promise<void> {
    const order = await db.order.findFirst({
      where: { id: orderId, companyId: ctx.companyId },
      select: { id: true, status: true, productionOrder: { select: { id: true } } },
    });
    if (!order) throw new DomainError("NOT_FOUND", "Pedido no encontrado.");

    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status, updatedById: ctx.userId } });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: status,
          reason,
          changedById: ctx.userId,
        },
      });
      // Business rule: confirming an order generates its production order,
      // pre-loaded with the standard kitchen task checklist.
      if (status === "CONFIRMADO" && !order.productionOrder) {
        const DEFAULT_TASKS = [
          { type: "PREPARAR_MEZCLA" as const, name: "Preparar mezcla" },
          { type: "HORNEAR" as const, name: "Hornear" },
          { type: "ENFRIAR" as const, name: "Enfriar" },
          { type: "RELLENAR" as const, name: "Rellenar" },
          { type: "CRUMB_COAT" as const, name: "Crumb coat" },
          { type: "DECORACION_FINAL" as const, name: "Decoración final" },
          { type: "EMPAQUE" as const, name: "Empaque" },
        ];
        await tx.productionOrder.create({
          data: {
            companyId: ctx.companyId,
            orderId,
            status: "PENDIENTE",
            tasks: {
              create: DEFAULT_TASKS.map((t, i) => ({
                companyId: ctx.companyId,
                type: t.type,
                name: t.name,
                sequence: i + 1,
                displayOrder: i + 1,
              })),
            },
          },
        });
      }
    });
  }

  async updateDelivery(
    ctx: RequestContext,
    orderId: string,
    input: UpdateDeliveryInput,
  ): Promise<void> {
    const order = await db.order.findFirst({
      where: { id: orderId, companyId: ctx.companyId },
      select: { id: true },
    });
    if (!order) throw new DomainError("NOT_FOUND", "Pedido no encontrado.");

    const deliveredAt = input.status === "ENTREGADO" ? new Date() : null;
    await db.$transaction(async (tx) => {
      await tx.delivery.upsert({
        where: { orderId },
        update: {
          type: input.type as DeliveryType,
          status: input.status as DeliveryStatus,
          address: input.address ?? null,
          zone: input.zone ?? null,
          feeCents: input.feeCents,
          courierName: input.courierName ?? null,
          scheduledAt: input.scheduledAt ?? null,
          deliveredAt,
        },
        create: {
          orderId,
          type: input.type as DeliveryType,
          status: input.status as DeliveryStatus,
          address: input.address ?? null,
          zone: input.zone ?? null,
          feeCents: input.feeCents,
          courierName: input.courierName ?? null,
          scheduledAt: input.scheduledAt ?? null,
          deliveredAt,
        },
      });
      // Keep the immutable snapshot on the order in sync.
      await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryAddressSnapshot: input.address ?? null,
          deliveryZoneSnapshot: input.zone ?? null,
          deliveryCourierSnapshot: input.courierName ?? null,
          deliveryFeeCentsSnapshot: input.feeCents,
        },
      });
    });
  }
}

export class PrismaOrderableQuotationRepository
  implements OrderableQuotationRepository
{
  async approvedWithoutOrder(ctx: RequestContext) {
    const rows = await db.quotation.findMany({
      where: {
        companyId: ctx.companyId,
        deletedAt: null,
        status: "APROBADA",
        order: null,
      },
      include: { customer: { select: { name: true } } },
      orderBy: { number: "desc" },
      take: 200,
    });
    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      customerName: r.customer?.name ?? "—",
      totalCents: r.totalCents,
    }));
  }
}
