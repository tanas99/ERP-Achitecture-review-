import { z } from "zod";
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { DomainError } from "@/modules/shared/domain/errors";
import { ok, type Result } from "@/modules/shared/domain/result";
import { LEAD_STATUSES } from "@/modules/crm/domain/types";
import type {
  CustomerRepository,
  DirectoryRepository,
  LeadRepository,
} from "./ports";
import type { CustomerFilters, LeadFilters } from "./filters";
import {
  addActivitySchema,
  createLeadSchema,
  updateLeadSchema,
} from "./lead-forms";
import { NotFoundError } from "@/modules/shared/domain/errors";
import type { LeadDetail, CustomerDetail } from "@/modules/crm/domain/types";
import {
  addAddressSchema,
  addNoteSchema,
  updateCustomerSchema,
} from "./customer-forms";

/**
 * Use-case factories. Each receives its repository port (dependency inversion);
 * infrastructure wires the concrete Prisma repositories. Every write authorizes
 * the caller (ARCHITECTURE.md §6) and validates input with Zod (§11).
 */

/** Flatten a ZodError into a { field: message } map for UI display. */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---- Reads -----------------------------------------------------------------
export function makeListLeads(repo: LeadRepository) {
  return (ctx: RequestContext, filters: LeadFilters) => {
    authorize(ctx, "leads:read");
    return repo.list(ctx, filters);
  };
}

export function makeListCustomers(repo: CustomerRepository) {
  return (ctx: RequestContext, filters: CustomerFilters) => {
    authorize(ctx, "customers:read");
    return repo.list(ctx, filters);
  };
}

export function makeListOptions(repo: DirectoryRepository) {
  return async (ctx: RequestContext) => {
    authorize(ctx, "leads:read");
    const [assignableUsers, tags] = await Promise.all([
      repo.assignableUsers(ctx),
      repo.tags(ctx),
    ]);
    return { assignableUsers, tags };
  };
}

export function makeGetLead(repo: LeadRepository) {
  return async (ctx: RequestContext, leadId: string): Promise<LeadDetail> => {
    authorize(ctx, "leads:read");
    const lead = await repo.findById(ctx, leadId);
    if (!lead) throw new NotFoundError("Lead no encontrado.");
    return lead;
  };
}

// ---- Create / edit / activity (writes) -------------------------------------
export function makeCreateLead(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<{ id: string }, DomainError>> => {
    authorize(ctx, "leads:write");
    const parsed = createLeadSchema.safeParse(input);
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

export function makeUpdateLead(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    leadId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "leads:write");
    const parsed = updateLeadSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    await repo.update(ctx, leadId, parsed.data);
    return ok(null);
  };
}

export function makeAddLeadActivity(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    leadId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "leads:write");
    const parsed = addActivitySchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    await repo.addActivity(ctx, leadId, parsed.data);
    return ok(null);
  };
}

// ---- Quick actions (writes) ------------------------------------------------
const changeStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]),
});

export function makeChangeLeadStatus(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "leads:write");
    const parsed = changeStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: new DomainError("VALIDATION", "Datos inválidos.") };
    }
    await repo.updateStatus(
      ctx,
      parsed.data.leadId,
      parsed.data.status as (typeof LEAD_STATUSES)[number],
    );
    return ok(null);
  };
}

const assignSchema = z.object({
  leadId: z.string().min(1),
  userId: z.string().min(1).nullable(),
});

export function makeAssignLead(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "leads:write");
    const parsed = assignSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: new DomainError("VALIDATION", "Datos inválidos.") };
    }
    await repo.assign(ctx, parsed.data.leadId, parsed.data.userId);
    return ok(null);
  };
}

const addTagSchema = z.object({
  customerId: z.string().min(1),
  tagId: z.string().min(1),
});

export function makeAddCustomerTag(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "customers:write");
    const parsed = addTagSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: new DomainError("VALIDATION", "Datos inválidos.") };
    }
    await repo.addTag(ctx, parsed.data.customerId, parsed.data.tagId);
    return ok(null);
  };
}

export function makeRemoveCustomerTag(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "customers:write");
    const parsed = addTagSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: new DomainError("VALIDATION", "Datos inválidos.") };
    }
    await repo.removeTag(ctx, parsed.data.customerId, parsed.data.tagId);
    return ok(null);
  };
}

export function makeConvertLeadToCustomer(repo: LeadRepository) {
  return async (
    ctx: RequestContext,
    leadId: string,
  ): Promise<Result<{ customerId: string }, DomainError>> => {
    authorize(ctx, "customers:write");
    const res = await repo.convert(ctx, leadId);
    return ok(res);
  };
}

// ---- Customer detail (read + writes) ---------------------------------------
export function makeGetCustomer(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    customerId: string,
  ): Promise<CustomerDetail> => {
    authorize(ctx, "customers:read");
    const c = await repo.findById(ctx, customerId);
    if (!c) throw new NotFoundError("Cliente no encontrado.");
    return c;
  };
}

export function makeUpdateCustomer(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    customerId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "customers:write");
    const parsed = updateCustomerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    await repo.updateInfo(ctx, customerId, parsed.data);
    return ok(null);
  };
}

export function makeAddCustomerAddress(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    customerId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "customers:write");
    const parsed = addAddressSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    await repo.addAddress(ctx, customerId, parsed.data);
    return ok(null);
  };
}

export function makeAddCustomerNote(repo: CustomerRepository) {
  return async (
    ctx: RequestContext,
    customerId: string,
    input: unknown,
  ): Promise<Result<null, DomainError>> => {
    authorize(ctx, "customers:write");
    const parsed = addNoteSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: new DomainError("VALIDATION", "Datos inválidos.", fieldErrors(parsed.error)),
      };
    }
    await repo.addNote(ctx, customerId, parsed.data);
    return ok(null);
  };
}
