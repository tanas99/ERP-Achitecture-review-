import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import type { CustomerRepository } from "@/modules/crm/application/ports";
import type { CustomerFilters } from "@/modules/crm/application/filters";
import type {
  CustomerDetail,
  CustomerListItem,
  CustomerTimelineType,
  IdentificationType,
  Paginated,
} from "@/modules/crm/domain/types";
import type {
  AddAddressInput,
  AddNoteInput,
  UpdateCustomerInput,
} from "@/modules/crm/application/customer-forms";
import { assertSameTenant } from "@/server/tenant";
import { buildCustomerWhere, paginationArgs } from "./where-builders";

export class PrismaCustomerRepository implements CustomerRepository {
  async list(
    ctx: RequestContext,
    filters: CustomerFilters,
  ): Promise<Paginated<CustomerListItem>> {
    const where = buildCustomerWhere(ctx.companyId, filters);
    const { skip, take } = paginationArgs(filters.page, filters.pageSize);

    const [rows, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        include: { tags: { include: { tag: true } } },
      }),
      db.customer.count({ where }),
    ]);

    const items: CustomerListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      identificationType: r.identificationType as IdentificationType,
      identification: r.identification,
      phone: r.phone,
      email: r.email,
      tags: r.tags.map((ct) => ({
        id: ct.tag.id,
        name: ct.tag.name,
        color: ct.tag.color,
      })),
      createdAt: r.createdAt,
    }));

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async findById(
    ctx: RequestContext,
    customerId: string,
  ): Promise<CustomerDetail | null> {
    const c = await db.customer.findFirst({
      where: { id: customerId, companyId: ctx.companyId, deletedAt: null },
      include: {
        addresses: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        customerNotes: { orderBy: { createdAt: "desc" }, take: 100 },
        timeline: { orderBy: { occurredAt: "desc" }, take: 100 },
      },
    });
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      identificationType: c.identificationType as IdentificationType,
      identification: c.identification,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      becameCustomerAt: c.becameCustomerAt,
      createdAt: c.createdAt,
      addresses: c.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        zone: a.zone,
        reference: a.reference,
        isDefault: a.isDefault,
      })),
      tags: c.tags.map((ct) => ({
        id: ct.tag.id,
        name: ct.tag.name,
        color: ct.tag.color,
      })),
      customerNotes: c.customerNotes.map((n) => ({
        id: n.id,
        body: n.body,
        createdAt: n.createdAt,
        createdById: n.createdById,
      })),
      timeline: c.timeline.map((t) => ({
        id: t.id,
        type: t.type as CustomerTimelineType,
        title: t.title,
        occurredAt: t.occurredAt,
      })),
    };
  }

  async updateInfo(
    ctx: RequestContext,
    customerId: string,
    input: UpdateCustomerInput,
  ): Promise<void> {
    const c = await db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, c);
    await db.customer.update({
      where: { id: customerId },
      data: {
        name: input.name,
        identificationType: input.identificationType,
        identification: input.identification,
        email: input.email,
        phone: input.phone,
        notes: input.notes,
        updatedById: ctx.userId,
      },
    });
  }

  async addAddress(
    ctx: RequestContext,
    customerId: string,
    input: AddAddressInput,
  ): Promise<void> {
    const c = await db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, c);

    await db.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }
      await tx.customerAddress.create({
        data: {
          customerId,
          label: input.label,
          address: input.address,
          zone: input.zone ?? null,
          reference: input.reference ?? null,
          isDefault: input.isDefault,
        },
      });
    });
  }

  async addNote(
    ctx: RequestContext,
    customerId: string,
    input: AddNoteInput,
  ): Promise<void> {
    const c = await db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, c);

    await db.$transaction([
      db.customerNote.create({
        data: { companyId: ctx.companyId, customerId, body: input.body, createdById: ctx.userId },
      }),
      db.customerTimelineEntry.create({
        data: {
          companyId: ctx.companyId,
          customerId,
          type: "NOTA_INTERNA",
          title: input.body.slice(0, 120),
          createdById: ctx.userId,
        },
      }),
    ]);
  }

  async addTag(
    ctx: RequestContext,
    customerId: string,
    tagId: string,
  ): Promise<void> {
    const [customer, tag] = await Promise.all([
      db.customer.findUnique({
        where: { id: customerId },
        select: { companyId: true },
      }),
      db.tag.findUnique({ where: { id: tagId }, select: { companyId: true } }),
    ]);
    assertSameTenant(ctx, customer);
    assertSameTenant(ctx, tag);

    await db.customerTag.upsert({
      where: { customerId_tagId: { customerId, tagId } },
      update: {},
      create: { customerId, tagId },
    });
  }

  async removeTag(
    ctx: RequestContext,
    customerId: string,
    tagId: string,
  ): Promise<void> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, customer);
    await db.customerTag.deleteMany({ where: { customerId, tagId } });
  }
}
