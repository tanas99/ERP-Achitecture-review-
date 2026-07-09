/** Quotations domain types (pure — no framework/Prisma imports). */
export type QuotationStatus =
  | "BORRADOR"
  | "ENVIADA"
  | "APROBADA"
  | "RECHAZADA"
  | "PERDIDA"
  | "EXPIRADA";

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "BORRADOR",
  "ENVIADA",
  "APROBADA",
  "RECHAZADA",
  "PERDIDA",
  "EXPIRADA",
];

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface QuotationListItem {
  id: string;
  number: number;
  status: QuotationStatus;
  partyName: string; // lead or customer name
  totalCents: number;
  validUntil: Date | null;
  createdAt: Date;
}

export interface QuotationDetail {
  id: string;
  number: number;
  status: QuotationStatus;
  leadId: string | null;
  customerId: string | null;
  partyName: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  validUntil: Date | null;
  notes: string | null;
  createdAt: Date;
  items: QuotationLineItem[];
}
