import Link from "next/link";
import type {
  ProductionListItem,
  ProductionStatus,
} from "@/modules/production/domain/types";
import { PRODUCTION_STATUSES } from "@/modules/production/domain/types";
import { PROD_STATUS_LABELS, formatDate } from "./labels";

/** Kitchen board: one column per production status, touch-friendly cards. */
export function ProductionBoard({
  items,
  includeFinished,
}: {
  items: ProductionListItem[];
  includeFinished: boolean;
}) {
  const statuses = includeFinished
    ? PRODUCTION_STATUSES
    : PRODUCTION_STATUSES.filter((s) => s !== "FINALIZADO");

  const byStatus = new Map<ProductionStatus, ProductionListItem[]>();
  for (const s of statuses) byStatus.set(s, []);
  for (const it of items) byStatus.get(it.status)?.push(it);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {statuses.map((s) => {
        const cards = byStatus.get(s) ?? [];
        return (
          <div key={s} className="w-64 shrink-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">{PROD_STATUS_LABELS[s]}</h3>
              <span className="text-xs text-muted-foreground">{cards.length}</span>
            </div>
            <div className="space-y-2">
              {cards.map((c) => (
                <Link
                  key={c.id}
                  href={`/produccion/${c.id}`}
                  className="block rounded-[var(--radius)] border border-border bg-card p-3 hover:border-primary"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{c.orderNumber}</span>
                    {(c.priority === "URGENT" || c.priority === "HIGH") && (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-500">
                        {c.priority === "URGENT" ? "Urgente" : "Alta"}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{c.customerName}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Entrega {formatDate(c.dueDate)}</span>
                    <span>
                      {c.tasksDone}/{c.tasksTotal} tareas
                    </span>
                  </div>
                </Link>
              ))}
              {cards.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
