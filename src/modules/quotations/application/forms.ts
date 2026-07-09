import { z } from "zod";
import { QUOTATION_STATUSES } from "@/modules/quotations/domain/types";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional());
const optionalDate = z.preprocess(emptyToUndef, z.coerce.date().optional());

export const quotationItemSchema = z.object({
  productId: optionalText,
  description: z.string().trim().min(1, "Describe el producto").max(300),
  quantity: z.coerce.number().int().min(1).max(100000),
  unitPriceCents: z.coerce.number().int().min(0),
});

export const createQuotationSchema = z
  .object({
    leadId: optionalText,
    customerId: optionalText,
    taxCode: z.string().trim().min(1).default("IVA_15"),
    validUntil: optionalDate,
    notes: optionalText,
    items: z.array(quotationItemSchema).min(1, "Agrega al menos un ítem"),
  })
  .refine((d) => Boolean(d.leadId) !== Boolean(d.customerId), {
    message: "La cotización debe pertenecer a un lead o a un cliente (uno de los dos).",
    path: ["leadId"],
  });
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export const quotationFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(QUOTATION_STATUSES as [string, ...string[]]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type QuotationFilters = z.infer<typeof quotationFiltersSchema>;

export function parseQuotationFilters(input: unknown): QuotationFilters {
  return quotationFiltersSchema.parse(input ?? {});
}
