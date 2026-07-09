"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { AssignedUser } from "@/modules/crm/domain/types";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/modules/crm/domain/types";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "./labels";

/** Filters + search for the Leads list. Reflects state in the URL (§9). */
export function LeadsToolbar({ users }: { users: AssignedUser[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // reset pagination on filter change
    startTransition(() => router.push(`/leads?${next.toString()}`));
  }

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      data-pending={pending ? "" : undefined}
    >
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Buscar por nombre, teléfono, correo…"
        aria-label="Buscar leads"
        onChange={(e) => {
          const v = e.target.value;
          window.clearTimeout((window as unknown as { __t?: number }).__t);
          (window as unknown as { __t?: number }).__t = window.setTimeout(
            () => setParam("q", v),
            350,
          );
        }}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Select
        aria-label="Filtrar por estado"
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">Todos los estados</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por fuente"
        defaultValue={params.get("source") ?? ""}
        onChange={(e) => setParam("source", e.target.value)}
      >
        <option value="">Todas las fuentes</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>
            {LEAD_SOURCE_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por vendedora"
        defaultValue={params.get("assignedToId") ?? ""}
        onChange={(e) => setParam("assignedToId", e.target.value)}
      >
        <option value="">Toda vendedora</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
