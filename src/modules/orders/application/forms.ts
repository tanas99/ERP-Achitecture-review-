import { z } from "zod";
import {
  DELIVERY_TYPES,
  DELIVERY_STATUSES,
  EVENT_TYPES,
  ORDER_PRIORITIES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_TIERS,
} from "@/modules/orders/domain/types";

const emptyToUndef = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional());
const optionalDate = z.preprocess(emptyToUndef, z.coerce.date().optional());

export const createOrderFromQuotationSchema = z.object({
  quotationId: z.string().min(1),
  priority: z.enum(ORDER_PRIORITIES as [string, ...string[]]).default("NORMAL"),
  dueDate: optionalDate,
  eventType: z.preprocess(emptyToUndef, z.enum(EVENT_TYPES as [string, ...string[]]).optional()),
  eventName: optionalText,
  eventDate: optionalDate,
  eventTime: optionalText,
  notes: optionalText,
});
export type CreateOrderFromQuotationInput = z.infer<typeof createOrderFromQuotationSchema>;

export const registerPaymentSchema = z.object({
  tier: z.enum(PAYMENT_TIERS as [string, ...string[]]),
  method: z.enum(PAYMENT_METHODS as [string, ...string[]]).default("TRANSFERENCIA"),
  amountCents: z.coerce.number().int().min(1, "El monto debe ser mayor a 0"),
  reference: optionalText,
});
export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;

export const updateDeliverySchema = z.object({
  type: z.enum(DELIVERY_TYPES as [string, ...string[]]),
  status: z.enum(DELIVERY_STATUSES as [string, ...string[]]).default("PENDIENTE"),
  address: optionalText,
  zone: optionalText,
  feeCents: z.coerce.number().int().min(0).default(0),
  courierName: optionalText,
  scheduledAt: optionalDate,
});
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;

export const setOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  reason: optionalText,
});
export type SetOrderStatusInput = z.infer<typeof setOrderStatusSchema>;

export const orderFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]).optional(),
  priority: z.enum(ORDER_PRIORITIES as [string, ...string[]]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type OrderFilters = z.infer<typeof orderFiltersSchema>;

export function parseOrderFilters(input: unknown): OrderFilters {
  return orderFiltersSchema.parse(input ?? {});
}
