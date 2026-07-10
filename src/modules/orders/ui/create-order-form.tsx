"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ORDER_PRIORITIES, EVENT_TYPES } from "@/modules/orders/domain/types";
import { PRIORITY_LABELS, EVENT_TYPE_LABELS, formatMoney } from "./labels";
import { createOrderFromQuotationAction } from "@/app/(app)/pedidos/actions";

type Q = { id: string; number: number; customerName: string; totalCents: number };
const inputCls =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CreateOrderForm({ quotations }: { quotations: Q[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (quotations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay cotizaciones aprobadas pendientes de convertir en pedido. Aprueba una
        cotización primero.
      </p>
    );
  }

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setSubmitting(true);
        const res = await createOrderFromQuotationAction({
          quotationId: String(fd.get("quotationId")),
          priority: String(fd.get("priority")),
          dueDate: String(fd.get("dueDate") ?? ""),
          eventType: String(fd.get("eventType") ?? ""),
          eventName: String(fd.get("eventName") ?? ""),
          eventDate: String(fd.get("eventDate") ?? ""),
          eventTime: String(fd.get("eventTime") ?? ""),
          notes: String(fd.get("notes") ?? ""),
        });
        setSubmitting(false);
        if (!res.ok) return setError(res.message);
        router.push(`/pedidos/${res.id}`);
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium">Cotización aprobada</label>
        <Select name="quotationId" className="w-full" required defaultValue="">
          <option value="" disabled>Selecciona…</option>
          {quotations.map((q) => (
            <option key={q.id} value={q.id}>
              #{q.number} · {q.customerName} · {formatMoney(q.totalCents)}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Prioridad</label>
          <Select name="priority" className="w-full" defaultValue="NORMAL">
            {ORDER_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha de entrega</label>
          <input name="dueDate" type="date" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de evento</label>
          <Select name="eventType" className="w-full" defaultValue="">
            <option value="">—</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre del evento</label>
          <input name="eventName" className={inputCls} placeholder="Ej. Cumple de Sofía" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha del evento</label>
          <input name="eventDate" type="date" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Hora del evento</label>
          <input name="eventTime" type="time" className={inputCls} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Notas</label>
          <input name="notes" className={inputCls} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creando…" : "Crear pedido"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
