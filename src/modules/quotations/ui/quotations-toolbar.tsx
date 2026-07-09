"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import { QUOTATION_STATUSES } from "@/modules/quotations/domain/types";
import { QUOTATION_STATUS_LABELS } from "./labels";

export function QuotationsToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    start(() => router.push(`/cotizaciones?${next.toString()}`));
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Buscar por número o nombre…"
        aria-label="Buscar cotizaciones"
        onChange={(e) => {
          const v = e.target.value;
          window.clearTimeout((window as unknown as { __tq?: number }).__tq);
          (window as unknown as { __tq?: number }).__tq = window.setTimeout(
            () => setParam("q", v),
            350,
          );
        }}
        className="h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm sm:w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Select
        aria-label="Filtrar por estado"
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">Todos los estados</option>
        {QUOTATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {QUOTATION_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
