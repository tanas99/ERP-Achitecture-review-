/** Calendar domain types (pure). Agenda derived from orders (deliveries + events). */
export type CalendarKind = "ENTREGA" | "EVENTO";

export interface CalendarItem {
  date: Date;
  kind: CalendarKind;
  orderId: string;
  orderNumber: number;
  title: string;
  customerName: string;
  status: string;
}

/** First day (inclusive) and next-month first day (exclusive) for a month. */
export function monthRange(year: number, month1to12: number): { from: Date; to: Date } {
  const from = new Date(Date.UTC(year, month1to12 - 1, 1));
  const to = new Date(Date.UTC(year, month1to12, 1));
  return { from, to };
}
