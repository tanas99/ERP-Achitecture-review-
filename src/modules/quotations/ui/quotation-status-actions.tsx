"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { QuotationStatus } from "@/modules/quotations/domain/types";
import {
  setQuotationStatusAction,
  acceptQuotationAction,
} from "@/app/(app)/cotizaciones/actions";

/**
 * Status actions for a quotation. Accepting converts the lead into a customer
 * (docs/flujo-conversion-lead-cliente.md) and links the quotation to it.
 */
export function QuotationStatusActions({
  quotationId,
  status,
}: {
  quotationId: string;
  status: QuotationStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function set(next: QuotationStatus) {
    start(async () => {
      await setQuotationStatusAction(quotationId, next);
      router.refresh();
    });
  }
  function accept() {
    start(async () => {
      await acceptQuotationAction(quotationId);
      router.refresh();
    });
  }

  const terminal = status === "APROBADA" || status === "EXPIRADA";
  if (terminal) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-busy={pending}>
      {status === "BORRADOR" && (
        <Button size="sm" variant="outline" onClick={() => set("ENVIADA")} disabled={pending}>
          Marcar como enviada
        </Button>
      )}
      <Button size="sm" onClick={accept} disabled={pending}>
        Aceptar (convierte en cliente)
      </Button>
      {status !== "RECHAZADA" && (
        <Button size="sm" variant="outline" onClick={() => set("RECHAZADA")} disabled={pending}>
          Rechazada
        </Button>
      )}
      {status !== "PERDIDA" && (
        <Button size="sm" variant="outline" onClick={() => set("PERDIDA")} disabled={pending}>
          Perdida
        </Button>
      )}
    </div>
  );
}
