"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { LEAD_ACTIVITY_TYPES } from "@/modules/crm/domain/types";
import { LEAD_ACTIVITY_LABELS } from "./labels";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { addLeadActivityAction } from "@/app/(app)/leads/actions";

/** Quick "log a contact" form shown on the lead detail page. */
export function AddActivityForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const input = {
          type: String(fd.get("type")),
          summary: String(fd.get("summary")),
        };
        startTransition(async () => {
          const res = await addLeadActivityAction(leadId, input);
          if (!res.ok) {
            setError(res.message);
            return;
          }
          setError(null);
          formRef.current?.reset();
          router.refresh();
        });
      }}
    >
      <Select name="type" aria-label="Tipo de actividad" defaultValue="LLAMADA">
        {LEAD_ACTIVITY_TYPES.map((t) => (
          <option key={t} value={t}>
            {LEAD_ACTIVITY_LABELS[t]}
          </option>
        ))}
      </Select>
      <input
        name="summary"
        required
        placeholder="¿Qué pasó en este contacto?"
        aria-label="Resumen"
        className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Registrar"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
