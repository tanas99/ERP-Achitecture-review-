import type { LeadActivityItem } from "@/modules/crm/domain/types";
import { LEAD_ACTIVITY_LABELS, formatDateTime } from "./labels";

/** Chronological activity feed for a lead (calls, messages, notes…). */
export function ActivityTimeline({ items }: { items: LeadActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay actividad. Registra el primer contacto arriba.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="flex gap-3">
          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {LEAD_ACTIVITY_LABELS[a.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(a.occurredAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{a.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
