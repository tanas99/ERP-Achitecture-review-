import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import { assertSameTenant } from "@/server/tenant";
import type {
  Paginated,
  QuotationRepository,
  QuotationDirectoryRepository,
} from "@/modules/quotations/application/ports";
import type { CreateQuotationInput, QuotationFilters } from "@/modules/quotations/application/forms";
import type {
  QuotationDetail,
  QuotationListItem,
  QuotationStatus,
} from "@/modules/quotations/domain/types";
import { computeQuotationTotals } from "@/modules/quotations/domain/totals";

/** Resolve the company's active tax percentage (0 for RIMPE Negocio Popular). */
async function activeTaxPercent(companyId: string): Promise<number> {
  const rate = await db.taxRate.findFirst({
    where: { companyId, isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });
  return rate ? Number(rate.percentage) : 0;
}

async function partyName(
  companyId: string,
  leadId: string | null,
  customerId: string | null,
): Promise<string> {
  if (customerId) {
    const c = await db.customer.findFirst({ where: { id: customerId, companyId }, select: { name: true } });
    return c?.name ?? "—";
  }
  if (leadId) {
    const l = await db.lead.findFirst({ where: { id: leadId, companyId }, select: { name: true } });
    return l?.name ?? "—";
  }
  return "—";
}

export class PrismaQuotationRepository implements QuotationRepository {
  async create(ctx: RequestContext, input: CreateQuotationInput): Promise<string> {
    // Validate the party belongs to the company.
    if (input.customerId) {
      const c = await db.customer.findUnique({ where: { id: input.customerId }, select: { companyId: true } });
      assertSameTenant(ctx, c);
    }
    if (input.leadId) {
      const l = await db.lead.findUnique({ where: { id: input.leadId }, select: { companyId: true } });
      assertSameTenant(ctx, l);
    }

    const taxPercent = await activeTaxPercent(ctx.companyId);
    const totals = computeQuotationTotals(
      input.items.map((i) => ({ quantity: i.quantity, unitPriceCents: i.unitPriceCents })),
      taxPercent,
    );

    return db.$transaction(async (tx) => {
      const last = await tx.quotation.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const number = (last?.number ?? 0) + 1;

      const q = await tx.quotation.create({
        data: {
          companyId: ctx.companyId,
          leadId: input.leadId ?? null,
          customerId: input.customerId ?? null,
          number,
          status: "BORRADOR",
          subtotalCents: totals.subtotalCents,
          taxCents: totals.taxCents,
          totalCents: totals.totalCents,
          validUntil: input.validUntil ?? null,
          notes: input.notes ?? null,
          createdById: ctx.userId,
          items: {
            create: input.items.map((it, idx) => ({
              productId: it.productId ?? null,
              description: it.description,
              quantity: it.quantity,
              unitPriceCents: it.unitPriceCents,
              lineTotalCents: totals.lines[idx]!.lineTotalCents,
            })),
          },
        },
        select: { id: true },
      });
      return q.id;
    });
  }

  async list(
    ctx: RequestContext,
    filters: QuotationFilters,
  ): Promise<Paginated<QuotationListItem>> {
    const where: Record<string, unknown> = {
      companyId: ctx.companyId,
      deletedAt: null,
    };
    if (filters.status) where.status = filters.status;
    if (filters.q) {
      const q = filters.q;
      const asNumber = Number(q);
      where.OR = [
        ...(Number.isInteger(asNumber) ? [{ number: asNumber }] : []),
        { lead: { name: { contains: q, mode: "insensitive" } } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
      ];
    }
    const skip = (filters.page - 1) * filters.pageSize;

    const [rows, total] = await Promise.all([
      db.quotation.findMany({
        where,
        orderBy: { number: "desc" },
        skip,
        take: filters.pageSize,
        include: {
          lead: { select: { name: true } },
          customer: { select: { name: true } },
        },
      }),
      db.quotation.count({ where }),
    ]);

    const items: QuotationListItem[] = rows.map((r) => ({
      id: r.id,
      number: r.number,
      status: r.status as QuotationStatus,
      partyName: r.customer?.name ?? r.lead?.name ?? "—",
      totalCents: r.totalCents,
      validUntil: r.validUntil,
      createdAt: r.createdAt,
    }));

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async findById(
    ctx: RequestContext,
    quotationId: string,
  ): Promise<QuotationDetail | null> {
    const q = await db.quotation.findFirst({
      where: { id: quotationId, companyId: ctx.companyId, deletedAt: null },
      include: {
        items: true,
        lead: { select: { name: true } },
        customer: { select: { name: true } },
      },
    });
    if (!q) return null;
    return {
      id: q.id,
      number: q.number,
      status: q.status as QuotationStatus,
      leadId: q.leadId,
      customerId: q.customerId,
      partyName: q.customer?.name ?? q.lead?.name ?? "—",
      subtotalCents: q.subtotalCents,
      taxCents: q.taxCents,
      totalCents: q.totalCents,
      validUntil: q.validUntil,
      notes: q.notes,
      createdAt: q.createdAt,
      items: q.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
        lineTotalCents: it.lineTotalCents,
      })),
    };
  }

  async setStatus(
    ctx: RequestContext,
    quotationId: string,
    status: QuotationStatus,
  ): Promise<void> {
    const q = await db.quotation.findUnique({
      where: { id: quotationId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, q);
    await db.quotation.update({
      where: { id: quotationId },
      data: { status, updatedById: ctx.userId },
    });
  }
}

export class PrismaQuotationDirectoryRepository
  implements QuotationDirectoryRepository
{
  async leadOptions(ctx: RequestContext) {
    return db.lead.findMany({
      where: { companyId: ctx.companyId, deletedAt: null, convertedCustomerId: null },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }
  async customerOptions(ctx: RequestContext) {
    return db.customer.findMany({
      where: { companyId: ctx.companyId, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 200,
    });
  }
}
