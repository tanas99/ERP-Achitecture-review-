/** Orders domain types (pure). */
export type OrderStatus =
  | "COTIZACION"
  | "ESPERANDO_ANTICIPO"
  | "CONFIRMADO"
  | "EN_PRODUCCION"
  | "LISTO"
  | "EN_ENTREGA"
  | "ENTREGADO"
  | "CANCELADO";

export type OrderPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type PaymentStatus =
  | "SIN_PAGO"
  | "RESERVA"
  | "ANTICIPO"
  | "PAGADO_TOTAL"
  | "REEMBOLSADO";
export type PaymentTier = "RESERVA" | "ANTICIPO" | "SALDO" | "TOTAL" | "REEMBOLSO";
export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";
export type DeliveryType = "PICKUP" | "INTERNAL" | "THIRD_PARTY";
export type DeliveryStatus = "PENDIENTE" | "EN_RUTA" | "ENTREGADO" | "FALLIDO";
export type EventType =
  | "CUMPLEANOS"
  | "BODA"
  | "BABY_SHOWER"
  | "CORPORATIVO"
  | "GRADUACION"
  | "OTRO";

export const ORDER_STATUSES: OrderStatus[] = [
  "COTIZACION",
  "ESPERANDO_ANTICIPO",
  "CONFIRMADO",
  "EN_PRODUCCION",
  "LISTO",
  "EN_ENTREGA",
  "ENTREGADO",
  "CANCELADO",
];
export const ORDER_PRIORITIES: OrderPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];
export const PAYMENT_TIERS: PaymentTier[] = ["RESERVA", "ANTICIPO", "SALDO", "TOTAL", "REEMBOLSO"];
export const PAYMENT_METHODS: PaymentMethod[] = ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "OTRO"];
export const DELIVERY_TYPES: DeliveryType[] = ["PICKUP", "INTERNAL", "THIRD_PARTY"];
export const DELIVERY_STATUSES: DeliveryStatus[] = ["PENDIENTE", "EN_RUTA", "ENTREGADO", "FALLIDO"];
export const EVENT_TYPES: EventType[] = ["CUMPLEANOS", "BODA", "BABY_SHOWER", "CORPORATIVO", "GRADUACION", "OTRO"];

export interface OrderItemView {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}
export interface PaymentView {
  id: string;
  tier: PaymentTier;
  method: PaymentMethod;
  amountCents: number;
  reference: string | null;
  paidAt: Date;
  confirmedAt: Date | null;
}
export interface DeliveryView {
  type: DeliveryType;
  status: DeliveryStatus;
  address: string | null;
  zone: string | null;
  feeCents: number;
  courierName: string | null;
  scheduledAt: Date | null;
  deliveredAt: Date | null;
}

export interface OrderListItem {
  id: string;
  number: number;
  status: OrderStatus;
  priority: OrderPriority;
  paymentStatus: PaymentStatus;
  customerName: string;
  totalCents: number;
  balanceCents: number;
  dueDate: Date | null;
  createdAt: Date;
}

export interface OrderDetail {
  id: string;
  number: number;
  status: OrderStatus;
  priority: OrderPriority;
  paymentStatus: PaymentStatus;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerIdentification: string | null;
  eventType: EventType | null;
  eventName: string | null;
  eventDate: Date | null;
  eventTime: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  balanceCents: number;
  dueDate: Date | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItemView[];
  payments: PaymentView[];
  delivery: DeliveryView | null;
  hasProductionOrder: boolean;
}
