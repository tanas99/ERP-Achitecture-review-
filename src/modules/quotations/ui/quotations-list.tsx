import Link from "next/link";
import type { QuotationListItem } from "@/modules/quotations/domain/types";
import { QuotationStatusBadge } from "./status-badge";
import { formatMoney, formatDate } from "./labels";

/** Responsive quotations list: table on >=md, cards on mobile. */
export function QuotationsList({ items }: { items: QuotationListItem[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[var(--radius)] border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">N.º</th>
              <th className="px-4 py-2 font-medium">Cliente / Lead</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Válida hasta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/cotizaciones/${q.id}`} className="font-medium hover:underline">
                    #{q.number}
                  </Link>
                </td>
                <td className="px-4 py-3">{q.partyName}</td>
                <td className="px-4 py-3">
                  <QuotationStatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3 font-medium">{formatMoney(q.totalCents)}</td>
                <td className="px-4 py-3">{formatDate(q.validUntil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((q) => (
          <li key={q.id} className="rounded-[var(--radius)] border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Link href={`/cotizaciones/${q.id}`} className="font-medium hover:underline">
                #{q.number} · {q.partyName}
              </Link>
              <QuotationStatusBadge status={q.status} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {formatMoney(q.totalCents)} · válida hasta {formatDate(q.validUntil)}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
