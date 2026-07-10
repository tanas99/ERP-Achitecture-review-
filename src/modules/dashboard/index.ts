/** Dashboard module — PUBLIC API. Read-only KPI aggregation for the home panel. */
import { authorize } from "@/server/auth/authorize";
import type { RequestContext } from "@/server/context";
import { db } from "@/server/db";

export interface DashboardData {
  ordersToday: number;
  inProduction: number;
  deliveriesUpcoming: number;
  receivableCents: number;
  pendingQuotations: number;
  openLeads: number;
  recentOrders: {
    id: string;
    number: number;
    customerName: string;
    status: string;
    totalCents: number;
    balanceCents: number;
  }[];
  todayDeliveries: { id: string; number: number; customerName: string; status: string }[];
}

export async function getDashboard(ctx: RequestContext): Promise<DashboardData> {
  authorize(ctx, "dashboard:view");

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(todayStart.getTime() + 24 * 3600 * 1000);
  const in7 = new Date(todayStart.getTime() + 7 * 24 * 3600 * 1000);
  const base = { companyId: ctx.companyId, deletedAt: null };

  const [
    ordersToday,
    inProduction,
    deliveriesUpcoming,
    receivable,
    pendingQuotations,
    openLeads,
    recentOrders,
    todayDeliveries,
  ] = await Promise.all([
    db.order.count({ where: { ...base, status: { not: "CANCELADO" }, dueDate: { gte: todayStart, lt: tomorrow } } }),
    db.productionOrder.count({ where: { companyId: ctx.companyId, status: { not: "FINALIZADO" } } }),
    db.order.count({
      where: { ...base, status: { notIn: ["CANCELADO", "ENTREGADO"] }, dueDate: { gte: todayStart, lt: in7 } },
    }),
    db.order.aggregate({
      where: { ...base, status: { not: "CANCELADO" }, balanceCents: { gt: 0 } },
      _sum: { balanceCents: true },
    }),
    db.quotation.count({ where: { ...base, status: "ENVIADA" } }),
    db.lead.count({ where: { ...base, convertedCustomerId: null, status: { not: "PERDIDO" } } }),
    db.order.findMany({
      where: base,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, number: true, customerNameSnapshot: true, status: true, totalCents: true, balanceCents: true },
    }),
    db.order.findMany({
      where: { ...base, status: { not: "CANCELADO" }, dueDate: { gte: todayStart, lt: tomorrow } },
      select: { id: true, number: true, customerNameSnapshot: true, status: true },
      orderBy: { number: "asc" },
    }),
  ]);

  return {
    ordersToday,
    inProduction,
    deliveriesUpcoming,
    receivableCents: receivable._sum.balanceCents ?? 0,
    pendingQuotations,
    openLeads,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerNameSnapshot,
      status: o.status,
      totalCents: o.totalCents,
      balanceCents: o.balanceCents,
    })),
    todayDeliveries: todayDeliveries.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerNameSnapshot,
      status: o.status,
    })),
  };
}
