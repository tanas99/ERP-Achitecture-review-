"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatMoney } from "./labels";
import { createQuotationAction } from "@/app/(app)/cotizaciones/actions";

type Party = { id: string; name: string };
type Row = { description: string; quantity: string; unitPrice: string };

const inputCls =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function QuotationForm({
  leads,
  customers,
}: {
  leads: Party[];
  customers: Party[];
}) {
  const router = useRouter();
  const [partyType, setPartyType] = useState<"lead" | "customer">(
    leads.length > 0 ? "lead" : "customer",
  );
  const [partyId, setPartyId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const q = Number(r.quantity) || 0;
        const p = Math.round((Number(r.unitPrice) || 0) * 100);
        return sum + q * p;
      }, 0),
    [rows],
  );

  const parties = partyType === "lead" ? leads : customers;

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function submit() {
    setError(null);
    if (!partyId) return setError("Elige a quién va dirigida la cotización.");
    const items = rows
      .filter((r) => r.description.trim())
      .map((r) => ({
        description: r.description.trim(),
        quantity: Math.max(1, Math.floor(Number(r.quantity) || 1)),
        unitPriceCents: Math.round((Number(r.unitPrice) || 0) * 100),
      }));
    if (items.length === 0) return setError("Agrega al menos un ítem con descripción.");

    setSubmitting(true);
    const input = {
      leadId: partyType === "lead" ? partyId : undefined,
      customerId: partyType === "customer" ? partyId : undefined,
      validUntil: validUntil || undefined,
      notes: notes || undefined,
      items,
    };
    const res = await createQuotationAction(input);
    setSubmitting(false);
    if (!res.ok) return setError(res.message);
    router.push(`/cotizaciones/${res.id}`);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Dirigida a</label>
          <Select
            className="w-full"
            value={partyType}
            onChange={(e) => {
              setPartyType(e.target.value as "lead" | "customer");
              setPartyId("");
            }}
          >
            <option value="lead">Lead</option>
            <option value="customer">Cliente</option>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">
            {partyType === "lead" ? "Lead" : "Cliente"}
          </label>
          <Select className="w-full" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
            <option value="">Selecciona…</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ítems</label>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className={`${inputCls} col-span-6`}
                placeholder="Descripción (ej. Vintage cake 20 porciones)"
                value={r.description}
                onChange={(e) => updateRow(i, { description: e.target.value })}
              />
              <input
                className={`${inputCls} col-span-2`}
                type="number"
                min="1"
                placeholder="Cant."
                value={r.quantity}
                onChange={(e) => updateRow(i, { quantity: e.target.value })}
              />
              <input
                className={`${inputCls} col-span-3`}
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio $"
                value={r.unitPrice}
                onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
              />
              <button
                type="button"
                aria-label="Quitar ítem"
                className="col-span-1 rounded-[var(--radius)] border border-border text-muted-foreground hover:bg-muted"
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRows((rs) => [...rs, { description: "", quantity: "1", unitPrice: "" }])}
        >
          + Agregar ítem
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Válida hasta (opcional)</label>
          <input className={inputCls} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Notas (opcional)</label>
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[var(--radius)] bg-muted/60 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Total (RIMPE Negocio Popular — sin IVA)
        </span>
        <span className="text-lg font-semibold">{formatMoney(total)}</span>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" onClick={submit} disabled={submitting}>
          {submitting ? "Guardando…" : "Crear cotización"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
