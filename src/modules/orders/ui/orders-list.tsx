import Link from "next/link";
import type { OrderListItem } from "@/modules/orders/domain/types";
import { OrderStatusBadge, PriorityBadge, PaymentBadge } from "./badges";
import { formatMoney, formatDate } from "./labels";

export function OrdersList({ items }: { items: OrderListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[var(--radius)] border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">N.º</th>
              <th className="px-4 py-2 font-medium">Cliente</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Pago</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Saldo</th>
              <th className="px-4 py-2 font-medium">Entrega</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/pedidos/${o.id}`} className="font-medium hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {o.customerName}
                    <PriorityBadge priority={o.priority} />
                  </div>
                </td>
                <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 font-medium">{formatMoney(o.totalCents)}</td>
                <td className="px-4 py-3">{formatMoney(o.balanceCents)}</td>
                <td className="px-4 py-3">{formatDate(o.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((o) => (
          <li key={o.id} className="rounded-[var(--radius)] border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Link href={`/pedidos/${o.id}`} className="font-medium hover:underline">
                #{o.number} · {o.customerName}
              </Link>
              <OrderStatusBadge status={o.status} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <PaymentBadge status={o.paymentStatus} />
              <span>Total {formatMoney(o.totalCents)} · saldo {formatMoney(o.balanceCents)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
