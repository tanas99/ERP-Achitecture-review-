"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
  DeliveryView,
  OrderStatus,
} from "@/modules/orders/domain/types";
import {
  ORDER_STATUSES,
  PAYMENT_TIERS,
  PAYMENT_METHODS,
  DELIVERY_TYPES,
  DELIVERY_STATUSES,
} from "@/modules/orders/domain/types";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_TIER_LABELS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_STATUS_LABELS,
} from "./labels";
import {
  registerPaymentAction,
  setOrderStatusAction,
  updateDeliveryAction,
} from "@/app/(app)/pedidos/actions";

const inputCls =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      aria-label="Cambiar estado del pedido"
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await setOrderStatusAction(orderId, e.target.value as OrderStatus);
          router.refresh();
        })
      }
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}

export function RegisterPaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const input = {
          tier: String(fd.get("tier")),
          method: String(fd.get("method")),
          amountCents: Math.round((Number(fd.get("amount")) || 0) * 100),
          reference: String(fd.get("reference") ?? ""),
        };
        start(async () => {
          const res = await registerPaymentAction(orderId, input);
          if (!res.ok) return setError(res.message);
          setError(null);
          ref.current?.reset();
          router.refresh();
        });
      }}
    >
      <Select name="tier" aria-label="Tipo de pago" defaultValue="ANTICIPO">
        {PAYMENT_TIERS.map((t) => (
          <option key={t} value={t}>{PAYMENT_TIER_LABELS[t]}</option>
        ))}
      </Select>
      <Select name="method" aria-label="Método" defaultValue="TRANSFERENCIA">
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
        ))}
      </Select>
      <input name="amount" type="number" min="0" step="0.01" placeholder="Monto $" className={inputCls} required />
      <input name="reference" placeholder="Referencia" className={inputCls} />
      <div className="col-span-2 sm:col-span-4">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Registrando…" : "Registrar pago"}
        </Button>
        {error && <span className="ml-2 text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

export function DeliveryForm({
  orderId,
  delivery,
}: {
  orderId: string;
  delivery: DeliveryView | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const input = {
          type: String(fd.get("type")),
          status: String(fd.get("status")),
          address: String(fd.get("address") ?? ""),
          zone: String(fd.get("zone") ?? ""),
          feeCents: Math.round((Number(fd.get("fee")) || 0) * 100),
          courierName: String(fd.get("courier") ?? ""),
        };
        start(async () => {
          const res = await updateDeliveryAction(orderId, input);
          if (!res.ok) return setError(res.message);
          setError(null);
          router.refresh();
        });
      }}
    >
      <Select name="type" aria-label="Tipo de entrega" defaultValue={delivery?.type ?? "PICKUP"} className="w-full">
        {DELIVERY_TYPES.map((t) => (
          <option key={t} value={t}>{DELIVERY_TYPE_LABELS[t]}</option>
        ))}
      </Select>
      <Select name="status" aria-label="Estado de entrega" defaultValue={delivery?.status ?? "PENDIENTE"} className="w-full">
        {DELIVERY_STATUSES.map((s) => (
          <option key={s} value={s}>{DELIVERY_STATUS_LABELS[s]}</option>
        ))}
      </Select>
      <input name="address" placeholder="Dirección" defaultValue={delivery?.address ?? ""} className={`${inputCls} sm:col-span-2`} />
      <input name="zone" placeholder="Zona" defaultValue={delivery?.zone ?? ""} className={inputCls} />
      <input name="fee" type="number" min="0" step="0.01" placeholder="Costo envío $" defaultValue={delivery ? (delivery.feeCents / 100).toString() : ""} className={inputCls} />
      <input name="courier" placeholder="Repartidor" defaultValue={delivery?.courierName ?? ""} className={`${inputCls} sm:col-span-2`} />
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Guardar entrega"}
        </Button>
        {error && <span className="ml-2 text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}
