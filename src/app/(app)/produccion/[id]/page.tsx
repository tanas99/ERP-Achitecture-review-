import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestContext } from "@/server/auth/context";
import { getProduction } from "@/modules/production";
import { NotFoundError } from "@/modules/shared/domain/errors";
import {
  ProductionStatusControl,
  TaskList,
} from "@/modules/production/ui/production-actions";
import { PROD_STATUS_LABELS, formatDate } from "@/modules/production/ui/labels";

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getRequestContext();
  const { id } = await params;

  let p;
  try {
    p = await getProduction(ctx, id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/produccion" className="text-sm text-muted-foreground hover:underline">← Producción</Link>
          <h1 className="mt-1 text-2xl font-semibold">
            Producción · Pedido #{p.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.customerName} · entrega {formatDate(p.dueDate)} · estado actual: {PROD_STATUS_LABELS[p.status]}
          </p>
        </div>
        <div className="w-56">
          <ProductionStatusControl id={p.id} status={p.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Qué hornear</h2>
          <ul className="space-y-1 text-sm">
            {p.items.map((it) => (
              <li key={it.id} className="flex justify-between border-b border-border py-1 last:border-0">
                <span>{it.description}</span>
                <span className="text-muted-foreground">×{it.quantity}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius)] border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Tareas de cocina</h2>
          <TaskList id={p.id} tasks={p.tasks} />
        </section>
      </div>
    </div>
  );
}
