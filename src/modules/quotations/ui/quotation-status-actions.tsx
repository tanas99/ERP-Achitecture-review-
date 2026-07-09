"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { QuotationStatus } from "@/modules/quotations/domain/types";
import { setQuotationStatusAction } from "@/app/(app)/cotizaciones/actions";

/**
 * Status actions for a quotation (Milestone 1: send / reject / mark lost).
 * Accepting a quotation (which converts a lead to a customer) arrives in M2.
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

  const terminal = status === "APROBADA" || status === "EXPIRADA";
  if (terminal) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-busy={pending}>
      {status === "BORRADOR" && (
        <Button size="sm" onClick={() => set("ENVIADA")} disabled={pending}>
          Marcar como enviada
        </Button>
      )}
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
