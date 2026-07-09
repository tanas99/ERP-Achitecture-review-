"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { TagRef } from "@/modules/crm/domain/types";

/** Filters + search for the Customers list. Reflects state in the URL (§9). */
export function CustomersToolbar({ tags }: { tags: TagRef[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.push(`/clientes?${next.toString()}`));
  }

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      data-pending={pending ? "" : undefined}
    >
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Buscar por nombre, teléfono, cédula/RUC…"
        aria-label="Buscar clientes"
        onChange={(e) => {
          const v = e.target.value;
          window.clearTimeout((window as unknown as { __tc?: number }).__tc);
          (window as unknown as { __tc?: number }).__tc = window.setTimeout(
            () => setParam("q", v),
            350,
          );
        }}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Select
        aria-label="Filtrar por etiqueta"
        defaultValue={params.get("tagId") ?? ""}
        onChange={(e) => setParam("tagId", e.target.value)}
      >
        <option value="">Todas las etiquetas</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
