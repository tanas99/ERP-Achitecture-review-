import { cn } from "@/lib/cn";
import type {
  OrderPriority,
  OrderStatus,
  PaymentStatus,
} from "@/modules/orders/domain/types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from "./labels";

const pill = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn(pill, ORDER_STATUS_STYLES[status])}>{ORDER_STATUS_LABELS[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: OrderPriority }) {
  if (priority === "NORMAL" || priority === "LOW") return null;
  return <span className={cn(pill, PRIORITY_STYLES[priority])}>{PRIORITY_LABELS[priority]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const styles =
    status === "PAGADO_TOTAL"
      ? "bg-emerald-500/15 text-emerald-500"
      : status === "SIN_PAGO"
        ? "bg-rose-500/15 text-rose-500"
        : "bg-amber-500/15 text-amber-500";
  return <span className={cn(pill, styles)}>{PAYMENT_STATUS_LABELS[status]}</span>;
}
