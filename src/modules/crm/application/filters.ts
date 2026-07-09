import { z } from "zod";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/modules/crm/domain/types";

/**
 * Filter/search schemas for the list views (validated at the boundary,
 * ARCHITECTURE.md §11). Parsed from URL searchParams so views are shareable.
 */
const pageSchema = z.coerce.number().int().min(1).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(20);

export const leadFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]).optional(),
  source: z.enum(LEAD_SOURCES as [string, ...string[]]).optional(),
  assignedToId: z.string().min(1).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export type LeadFilters = z.infer<typeof leadFiltersSchema>;

export const customerFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  tagId: z.string().min(1).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export type CustomerFilters = z.infer<typeof customerFiltersSchema>;

/** Safe-parse helper that always yields defaults on bad input. */
export function parseLeadFilters(input: unknown): LeadFilters {
  return leadFiltersSchema.parse(input ?? {});
}

export function parseCustomerFilters(input: unknown): CustomerFilters {
  return customerFiltersSchema.parse(input ?? {});
}
