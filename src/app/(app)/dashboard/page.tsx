import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { getDashboard } from "@/modules/dashboard";
import { OrderStatusBadge } from "@/modules/orders/ui/badges";
import { formatMoney } from "@/modules/orders/ui/labels";
import type { OrderStatus } from "@/modules/orders";

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "pink" | "yellow" | "green" | "lav";
}) {
  const tones: Record<string, string> = {
    pink: "bg-primary/12 text-foreground",
    yellow: "bg-amber-400/15 text-foreground",
    green: "bg-emerald-400/15 text-foreground",
    lav: "bg-violet-400/15 text-foreground",
  };
  return (
    <div className={`rounded-[var(--radius)] p-5 ${tones[tone]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = await getRequestContext();
  const d = await getDashboard(ctx);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Buenos días, Tana</h1>
        <p className="text-sm text-muted-foreground">Un vistazo a tu día en la pastelería</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="pink" label="Entregas hoy" value={String(d.ordersToday)} />
        <StatCard tone="yellow" label="En producción" value={String(d.inProduction)} />
        <StatCard tone="green" label="Entregas 7 días" value={String(d.deliveriesUpcoming)} />
        <StatCard tone="lav" label="Por cobrar" value={formatMoney(d.receivableCents)} hint="saldos pendientes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Entregas de hoy</h2>
          {d.todayDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay entregas programadas para hoy.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {d.todayDeliveries.map((o) => (
                <li key={o.id} className="flex items-center justify-between border-b border-border py-1 last:border-0">
                  <Link href={`/pedidos/${o.id}`} className="hover:underline">
                    #{o.number} · {o.customerName}
                  </Link>
                  <OrderStatusBadge status={o.status as OrderStatus} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Pipeline</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/leads" className="rounded-[var(--radius)] bg-muted/60 p-3 hover:bg-muted">
              <div className="text-2xl font-bold">{d.openLeads}</div>
              <div className="text-muted-foreground">Leads abiertos</div>
            </Link>
            <Link href="/cotizaciones?status=ENVIADA" className="rounded-[var(--radius)] bg-muted/60 p-3 hover:bg-muted">
              <div className="text-2xl font-bold">{d.pendingQuotations}</div>
              <div className="text-muted-foreground">Cotizaciones enviadas</div>
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius)] border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pedidos recientes</h2>
          <Link href="/pedidos" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        {d.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {d.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-border py-1 last:border-0">
                <Link href={`/pedidos/${o.id}`} className="hover:underline">
                  #{o.number} · {o.customerName}
                </Link>
                <span className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status as OrderStatus} />
                  <span className="text-muted-foreground">saldo {formatMoney(o.balanceCents)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
