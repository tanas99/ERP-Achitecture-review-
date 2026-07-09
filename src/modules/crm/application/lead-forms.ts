import { z } from "zod";
import {
  LEAD_ACTIVITY_TYPES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LOST_REASONS,
} from "@/modules/crm/domain/types";

/**
 * Form schemas for Lead create/edit and activity logging (validated on both
 * client via RHF and server, ARCHITECTURE.md §11). Shared source of truth.
 */

// Treat empty strings from HTML forms as "absent". `.optional()` lives INSIDE
// the preprocess target so a blank field resolves to `undefined` and skips the
// inner validation (e.g. email format) instead of failing it.
const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);

const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional());
const optionalEmail = z.preprocess(
  emptyToUndef,
  z.string().trim().email().optional(),
);
const optionalDate = z.preprocess(emptyToUndef, z.coerce.date().optional());

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(160),
  source: z.enum(LEAD_SOURCES as [string, ...string[]]).default("OTRO"),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]).default("NUEVO"),
  phone: optionalText,
  email: optionalEmail,
  socialHandle: optionalText,
  referredBy: optionalText,
  assignedToId: optionalText,
  nextFollowUpAt: optionalDate,
  notes: optionalText,
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema
  .extend({
    lastContactAt: optionalDate,
    lostReason: z.enum(LOST_REASONS as [string, ...string[]]).optional(),
    lostReasonNote: optionalText,
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "No hay cambios que guardar",
  });
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const addActivitySchema = z.object({
  type: z.enum(LEAD_ACTIVITY_TYPES as [string, ...string[]]).default("NOTA"),
  summary: z.string().trim().min(1, "Escribe una nota").max(1000),
  occurredAt: optionalDate,
});
export type AddActivityInput = z.infer<typeof addActivitySchema>;
