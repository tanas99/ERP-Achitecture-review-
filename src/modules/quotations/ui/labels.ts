import type { QuotationStatus } from "@/modules/quotations/domain/types";

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  PERDIDA: "Perdida",
  EXPIRADA: "Expirada",
};

export const QUOTATION_STATUS_STYLES: Record<QuotationStatus, string> = {
  BORRADOR: "bg-muted text-muted-foreground",
  ENVIADA: "bg-blue-500/15 text-blue-500",
  APROBADA: "bg-emerald-500/15 text-emerald-500",
  RECHAZADA: "bg-rose-500/15 text-rose-500",
  PERDIDA: "bg-rose-500/15 text-rose-500",
  EXPIRADA: "bg-amber-500/15 text-amber-500",
};

/** Format integer cents as USD (es-EC). */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
