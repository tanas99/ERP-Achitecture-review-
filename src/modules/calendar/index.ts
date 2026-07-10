/** Calendar module — PUBLIC API. Read-only agenda of deliveries and events. */
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { db } from "@/server/db";
import { monthRange, type CalendarItem } from "./domain/types";

export type { CalendarItem } from "./domain/types";

export async function listCalendarMonth(
  ctx: RequestContext,
  year: number,
  month: number,
): Promise<CalendarItem[]> {
  authorize(ctx, "calendar:read");
  const { from, to } = monthRange(year, month);

  const [deliveries, events] = await Promise.all([
    db.order.findMany({
      where: {
        companyId: ctx.companyId,
        deletedAt: null,
        status: { not: "CANCELADO" },
        dueDate: { gte: from, lt: to },
      },
      select: { id: true, number: true, customerNameSnapshot: true, status: true, dueDate: true },
    }),
    db.order.findMany({
      where: {
        companyId: ctx.companyId,
        deletedAt: null,
        status: { not: "CANCELADO" },
        eventDate: { gte: from, lt: to },
      },
      select: {
        id: true,
        number: true,
        customerNameSnapshot: true,
        status: true,
        eventDate: true,
        eventName: true,
        eventType: true,
      },
    }),
  ]);

  const items: CalendarItem[] = [
    ...deliveries.map((o) => ({
      date: o.dueDate as Date,
      kind: "ENTREGA" as const,
      orderId: o.id,
      orderNumber: o.number,
      title: `Entrega pedido #${o.number}`,
      customerName: o.customerNameSnapshot,
      status: o.status,
    })),
    ...events.map((o) => ({
      date: o.eventDate as Date,
      kind: "EVENTO" as const,
      orderId: o.id,
      orderNumber: o.number,
      title: o.eventName || `Evento (${o.eventType ?? "—"})`,
      customerName: o.customerNameSnapshot,
      status: o.status,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return items;
}
