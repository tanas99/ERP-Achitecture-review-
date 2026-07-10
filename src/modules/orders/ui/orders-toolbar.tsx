"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_PRIORITIES } from "@/modules/orders/domain/types";
import { ORDER_STATUS_LABELS, PRIORITY_LABELS } from "./labels";

export function OrdersToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    start(() => router.push(`/pedidos?${next.toString()}`));
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Buscar por número o cliente…"
        aria-label="Buscar pedidos"
        onChange={(e) => {
          const v = e.target.value;
          window.clearTimeout((window as unknown as { __to?: number }).__to);
          (window as unknown as { __to?: number }).__to = window.setTimeout(() => setParam("q", v), 350);
        }}
        className="h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm sm:w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Select aria-label="Filtrar por estado" defaultValue={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
        <option value="">Todos los estados</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
        ))}
      </Select>
      <Select aria-label="Filtrar por prioridad" defaultValue={params.get("priority") ?? ""} onChange={(e) => setParam("priority", e.target.value)}>
        <option value="">Toda prioridad</option>
        {ORDER_PRIORITIES.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </Select>
    </div>
  );
}
