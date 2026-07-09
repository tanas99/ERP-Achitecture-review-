import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestContext } from "@/server/auth/context";
import { getQuotation } from "@/modules/quotations";
import { NotFoundError } from "@/modules/shared/domain/errors";
import { QuotationStatusBadge } from "@/modules/quotations/ui/status-badge";
import { QuotationStatusActions } from "@/modules/quotations/ui/quotation-status-actions";
import { formatMoney, formatDate } from "@/modules/quotations/ui/labels";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getRequestContext();
  const { id } = await params;

  let q;
  try {
    q = await getQuotation(ctx, id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/cotizaciones" className="text-sm text-muted-foreground hover:underline">
            ← Cotizaciones
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            Cotización #{q.number} <QuotationStatusBadge status={q.status} />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {q.partyName} · {formatDate(q.createdAt)}
            {q.validUntil ? ` · válida hasta ${formatDate(q.validUntil)}` : ""}
          </p>
        </div>
        <QuotationStatusActions quotationId={q.id} status={q.status} />
      </div>

      <section className="rounded-[var(--radius)] border border-border bg-card p-5">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="pb-2 font-medium">Descripción</th>
              <th className="pb-2 text-right font-medium">Cant.</th>
              <th className="pb-2 text-right font-medium">P. unit.</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatMoney(it.unitPriceCents)}</td>
                <td className="py-2 text-right">{formatMoney(it.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-col items-end gap-1 text-sm">
          {q.taxCents > 0 ? (
            <>
              <div className="flex w-56 justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(q.subtotalCents)}</span>
              </div>
              <div className="flex w-56 justify-between">
                <span className="text-muted-foreground">IVA</span>
                <span>{formatMoney(q.taxCents)}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              RIMPE Negocio Popular — sin IVA
            </span>
          )}
          <div className="flex w-56 justify-between border-t border-border pt-1 text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(q.totalCents)}</span>
          </div>
        </div>
      </section>

      {q.notes && (
        <section className="rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold">Notas</h2>
          <p className="text-sm text-muted-foreground">{q.notes}</p>
        </section>
      )}
    </div>
  );
}
