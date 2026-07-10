import type {
  DeliveryStatus,
  DeliveryType,
  EventType,
  OrderPriority,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentTier,
} from "@/modules/orders/domain/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  COTIZACION: "Cotización",
  ESPERANDO_ANTICIPO: "Esperando anticipo",
  CONFIRMADO: "Confirmado",
  EN_PRODUCCION: "En producción",
  LISTO: "Listo",
  EN_ENTREGA: "En entrega",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  COTIZACION: "bg-muted text-muted-foreground",
  ESPERANDO_ANTICIPO: "bg-amber-500/15 text-amber-500",
  CONFIRMADO: "bg-blue-500/15 text-blue-500",
  EN_PRODUCCION: "bg-violet-500/15 text-violet-500",
  LISTO: "bg-teal-500/15 text-teal-500",
  EN_ENTREGA: "bg-orange-500/15 text-orange-500",
  ENTREGADO: "bg-emerald-500/15 text-emerald-500",
  CANCELADO: "bg-rose-500/15 text-rose-500",
};

export const PRIORITY_LABELS: Record<OrderPriority, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};
export const PRIORITY_STYLES: Record<OrderPriority, string> = {
  LOW: "bg-muted text-muted-foreground",
  NORMAL: "bg-muted text-muted-foreground",
  HIGH: "bg-orange-500/15 text-orange-500",
  URGENT: "bg-rose-500/15 text-rose-500",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  SIN_PAGO: "Sin pago",
  RESERVA: "Reserva",
  ANTICIPO: "Anticipo",
  PAGADO_TOTAL: "Pagado total",
  REEMBOLSADO: "Reembolsado",
};

export const PAYMENT_TIER_LABELS: Record<PaymentTier, string> = {
  RESERVA: "Reserva ($10)",
  ANTICIPO: "Anticipo (50%)",
  SALDO: "Saldo",
  TOTAL: "Pago total",
  REEMBOLSO: "Reembolso",
};
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  PICKUP: "Retiro en local",
  INTERNAL: "Entrega interna",
  THIRD_PARTY: "Entrega por terceros",
};
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_RUTA: "En ruta",
  ENTREGADO: "Entregado",
  FALLIDO: "Fallido",
};
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CUMPLEANOS: "Cumpleaños",
  BODA: "Boda",
  BABY_SHOWER: "Baby shower",
  CORPORATIVO: "Corporativo",
  GRADUACION: "Graduación",
  OTRO: "Otro",
};

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(cents / 100);
}
export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}
