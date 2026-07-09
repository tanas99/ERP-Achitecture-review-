import { db } from "@/server/db";
import type { RequestContext } from "@/server/context";
import type { LeadRepository } from "@/modules/crm/application/ports";
import type { LeadFilters } from "@/modules/crm/application/filters";
import type {
  LeadDetail,
  LeadListItem,
  LeadSource,
  LeadStatus,
  LostReason,
  LeadActivityType,
  Paginated,
} from "@/modules/crm/domain/types";
import type {
  AddActivityInput,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/modules/crm/application/lead-forms";
import { assertSameTenant } from "@/server/tenant";
import { buildLeadWhere, paginationArgs } from "./where-builders";

export class PrismaLeadRepository implements LeadRepository {
  async list(
    ctx: RequestContext,
    filters: LeadFilters,
  ): Promise<Paginated<LeadListItem>> {
    const where = buildLeadWhere(ctx.companyId, filters);
    const { skip, take } = paginationArgs(filters.page, filters.pageSize);

    const [rows, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      db.lead.count({ where }),
    ]);

    // Resolve assigned users in one query (avoids N+1).
    const userIds = [...new Set(rows.map((r) => r.assignedToId).filter(Boolean))] as string[];
    const users = userIds.length
      ? await db.user.findMany({
          where: { id: { in: userIds }, companyId: ctx.companyId },
          select: { id: true, name: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const items: LeadListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      source: r.source as LeadListItem["source"],
      status: r.status as LeadStatus,
      phone: r.phone,
      email: r.email,
      assignedTo: r.assignedToId
        ? { id: r.assignedToId, name: userMap.get(r.assignedToId)?.name ?? "—" }
        : null,
      lastContactAt: r.lastContactAt,
      nextFollowUpAt: r.nextFollowUpAt,
      createdAt: r.createdAt,
    }));

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async findById(
    ctx: RequestContext,
    leadId: string,
  ): Promise<LeadDetail | null> {
    const lead = await db.lead.findFirst({
      where: { id: leadId, companyId: ctx.companyId, deletedAt: null },
      include: {
        activities: { orderBy: { occurredAt: "desc" }, take: 100 },
      },
    });
    if (!lead) return null;

    const assignee = lead.assignedToId
      ? await db.user.findFirst({
          where: { id: lead.assignedToId, companyId: ctx.companyId },
          select: { id: true, name: true },
        })
      : null;

    return {
      id: lead.id,
      name: lead.name,
      source: lead.source as LeadSource,
      status: lead.status as LeadStatus,
      phone: lead.phone,
      email: lead.email,
      socialHandle: lead.socialHandle,
      referredBy: lead.referredBy,
      notes: lead.notes,
      assignedTo: assignee ? { id: assignee.id, name: assignee.name } : null,
      lastContactAt: lead.lastContactAt,
      nextFollowUpAt: lead.nextFollowUpAt,
      lostReason: (lead.lostReason as LostReason | null) ?? null,
      lostReasonNote: lead.lostReasonNote,
      convertedAt: lead.convertedAt,
      convertedCustomerId: lead.convertedCustomerId,
      createdAt: lead.createdAt,
      activities: lead.activities.map((a) => ({
        id: a.id,
        type: a.type as LeadActivityType,
        summary: a.summary,
        occurredAt: a.occurredAt,
        createdById: a.createdById,
      })),
    };
  }

  async create(ctx: RequestContext, input: CreateLeadInput): Promise<string> {
    if (input.assignedToId) {
      const user = await db.user.findUnique({
        where: { id: input.assignedToId },
        select: { companyId: true },
      });
      assertSameTenant(ctx, user);
    }
    const lead = await db.lead.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        source: input.source,
        status: input.status,
        phone: input.phone ?? null,
        email: input.email ?? null,
        socialHandle: input.socialHandle ?? null,
        referredBy: input.referredBy ?? null,
        assignedToId: input.assignedToId ?? null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        notes: input.notes ?? null,
        createdById: ctx.userId,
      },
      select: { id: true },
    });
    return lead.id;
  }

  async update(
    ctx: RequestContext,
    leadId: string,
    input: UpdateLeadInput,
  ): Promise<void> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, lead);

    if (input.assignedToId) {
      const user = await db.user.findUnique({
        where: { id: input.assignedToId },
        select: { companyId: true },
      });
      assertSameTenant(ctx, user);
    }

    // Only set provided fields (partial update).
    await db.lead.update({
      where: { id: leadId },
      data: {
        name: input.name,
        source: input.source,
        status: input.status,
        phone: input.phone,
        email: input.email,
        socialHandle: input.socialHandle,
        referredBy: input.referredBy,
        assignedToId: input.assignedToId,
        nextFollowUpAt: input.nextFollowUpAt,
        lastContactAt: input.lastContactAt,
        lostReason: input.lostReason,
        lostReasonNote: input.lostReasonNote,
        notes: input.notes,
      },
    });
  }

  async addActivity(
    ctx: RequestContext,
    leadId: string,
    input: AddActivityInput,
  ): Promise<void> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, lead);

    const occurredAt = input.occurredAt ?? new Date();
    await db.$transaction([
      db.leadActivity.create({
        data: {
          leadId,
          type: input.type,
          summary: input.summary,
          occurredAt,
          createdById: ctx.userId,
        },
      }),
      // Logging a contact updates the lead's "last contact" marker.
      db.lead.update({
        where: { id: leadId },
        data: { lastContactAt: occurredAt },
      }),
    ]);
  }

  async updateStatus(
    ctx: RequestContext,
    leadId: string,
    status: LeadStatus,
  ): Promise<void> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true, status: true },
    });
    assertSameTenant(ctx, lead);

    await db.$transaction([
      db.lead.update({ where: { id: leadId }, data: { status } }),
      db.leadActivity.create({
        data: {
          leadId,
          type: "NOTA",
          summary: `Estado cambiado a ${status}`,
          createdById: ctx.userId,
        },
      }),
    ]);
  }

  async assign(
    ctx: RequestContext,
    leadId: string,
    userId: string | null,
  ): Promise<void> {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { companyId: true },
    });
    assertSameTenant(ctx, lead);

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      assertSameTenant(ctx, user); // assignee must belong to the same company
    }

    await db.lead.update({
      where: { id: leadId },
      data: { assignedToId: userId },
    });
  }
}
