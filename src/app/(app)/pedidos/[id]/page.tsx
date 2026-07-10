import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestContext } from "@/server/auth/context";
import { getOrder } from "@/modules/orders";
import { NotFoundError } from "@/modules/shared/domain/errors";
import { OrderStatusBadge, PriorityBadge, PaymentBadge } from "@/modules/orders/ui/badges";
import {
  OrderStatusControl,
  RegisterPaymentForm,
  DeliveryForm,
} from "@/modules/orders/ui/order-actions";
import {
  formatMoney,
  formatDate,
  PAYMENT_TIER_LABELS,
  PAYMENT_METHOD_LABELS,
  EVENT_TYPE_LABELS,
} from "@/modules/orders/ui/labels";

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getRequestContext();
  const { id } = await params;

  let o;
  try {
    o = await getOrder(ctx, id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/pedidos" className="text-sm text-muted-foreground hover:underline">← Pedidos</Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            Pedido #{o.number}
            <OrderStatusBadge status={o.status} />
            <PriorityBadge priority={o.priority} />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {o.customerId ? (
              <Link href={`/clientes/${o.customerId}`} className="hover:underline">{o.customerName}</Link>
            ) : o.customerName}
            {o.customerPhone ? ` · ${o.customerPhone}` : ""} · creado {formatDate(o.createdAt)}
            {o.dueDate ? ` · entrega ${formatDate(o.dueDate)}` : ""}
          </p>
        </div>
        <div className="w-56">
          <OrderStatusControl orderId={o.id} status={o.status} />
        </div>
      </div>

      {o.eventType && (
        <div className="rounded-[var(--radius)] border border-border bg-muted/40 p-3 text-sm">
          Evento: <b>{EVENT_TYPE_LABELS[o.eventType]}</b>
          {o.eventName ? ` — ${o.eventName}` : ""}
          {o.eventDate ? ` · ${formatDate(o.eventDate)}` : ""}
          {o.eventTime ? ` ${o.eventTime}` : ""}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Detalle del pedido">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Descripción</th>
                <th className="pb-2 text-right font-medium">Cant.</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">{formatMoney(it.lineTotalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex justify-end text-base font-semibold">
            Total: {formatMoney(o.totalCents)}
          </div>
        </Card>

        <Card title="Pagos" action={<PaymentBadge status={o.paymentStatus} />}>
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-[var(--radius)] bg-muted/60 p-3">
              <div className="text-muted-foreground">Pagado</div>
              <div className="text-lg font-semibold">{formatMoney(o.paidCents)}</div>
            </div>
            <div className="rounded-[var(--radius)] bg-muted/60 p-3">
              <div className="text-muted-foreground">Saldo</div>
              <div className="text-lg font-semibold">{formatMoney(o.balanceCents)}</div>
            </div>
          </div>
          <RegisterPaymentForm orderId={o.id} />
          {o.payments.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {o.payments.map((p) => (
                <li key={p.id} className="flex justify-between border-t border-border py-1">
                  <span>{PAYMENT_TIER_LABELS[p.tier]} · {PAYMENT_METHOD_LABELS[p.method]}</span>
                  <span className="font-medium">{formatMoney(p.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Entrega">
          <DeliveryForm orderId={o.id} delivery={o.delivery} />
        </Card>

        <Card title="Producción">
          {o.hasProductionOrder ? (
            <p className="text-sm text-muted-foreground">
              Orden de producción generada. La cocina la verá en su tablero.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Al confirmar el pedido se genera automáticamente su orden de producción.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
