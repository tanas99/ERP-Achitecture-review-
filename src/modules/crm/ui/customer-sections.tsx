"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
  CustomerAddressItem,
  CustomerNoteItem,
  TagRef,
} from "@/modules/crm/domain/types";
import {
  addCustomerAddressAction,
  addCustomerNoteAction,
  addCustomerTagAction,
  removeCustomerTagAction,
} from "@/app/(app)/clientes/actions";

const inputCls =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Tags: current chips (removable) + add from existing company tags. */
export function TagManager({
  customerId,
  tags,
  allTags,
}: {
  customerId: string;
  tags: TagRef[];
  allTags: TagRef[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const available = allTags.filter((t) => !tags.some((x) => x.id === t.id));

  return (
    <div className="space-y-3" aria-busy={pending}>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <span className="text-sm text-muted-foreground">Sin etiquetas</span>
        )}
        {tags.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs"
            style={t.color ? { borderColor: t.color, color: t.color } : undefined}
          >
            {t.name}
            <button
              type="button"
              aria-label={`Quitar ${t.name}`}
              className="ml-1 opacity-70 hover:opacity-100"
              onClick={() =>
                start(async () => {
                  await removeCustomerTagAction(customerId, t.id);
                  router.refresh();
                })
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {available.length > 0 && (
        <Select
          aria-label="Agregar etiqueta"
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) return;
            start(async () => {
              await addCustomerTagAction(customerId, id);
              router.refresh();
            });
          }}
        >
          <option value="">+ Agregar etiqueta…</option>
          {available.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}

export function AddAddressForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className="grid gap-2 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const input = {
          label: String(fd.get("label") ?? ""),
          address: String(fd.get("address") ?? ""),
          zone: String(fd.get("zone") ?? ""),
          reference: String(fd.get("reference") ?? ""),
          isDefault: fd.get("isDefault") === "on",
        };
        start(async () => {
          const res = await addCustomerAddressAction(customerId, input);
          if (!res.ok) return setError(res.message);
          setError(null);
          ref.current?.reset();
          router.refresh();
        });
      }}
    >
      <input name="label" placeholder="Etiqueta (Casa, Oficina…)" className={inputCls} />
      <input name="zone" placeholder="Zona (opcional)" className={inputCls} />
      <input name="address" placeholder="Dirección" className={`${inputCls} sm:col-span-2`} />
      <input name="reference" placeholder="Referencia (opcional)" className={`${inputCls} sm:col-span-2`} />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="isDefault" /> Marcar como principal
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Agregando…" : "Agregar dirección"}
        </Button>
        {error && <span className="ml-2 text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

export function AddNoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await addCustomerNoteAction(customerId, { body: String(fd.get("body") ?? "") });
          if (!res.ok) return setError(res.message);
          setError(null);
          ref.current?.reset();
          router.refresh();
        });
      }}
    >
      <input name="body" required placeholder="Escribe una nota…" className={`${inputCls} flex-1`} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Agregar"}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </form>
  );
}

export function AddressList({ items }: { items: CustomerAddressItem[] }) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">Aún no hay direcciones.</p>;
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.id} className="rounded-[var(--radius)] border border-border p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{a.label}</span>
            {a.isDefault && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                Principal
              </span>
            )}
          </div>
          <div className="text-muted-foreground">{a.address}</div>
          {(a.zone || a.reference) && (
            <div className="text-xs text-muted-foreground">
              {[a.zone, a.reference].filter(Boolean).join(" · ")}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function NotesList({ items }: { items: CustomerNoteItem[] }) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">Aún no hay notas.</p>;
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li key={n.id} className="rounded-[var(--radius)] bg-muted/60 p-3 text-sm">
          <div>{n.body}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("es-EC", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(n.createdAt)}
          </div>
        </li>
      ))}
    </ul>
  );
}
