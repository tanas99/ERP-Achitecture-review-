import { cn } from "@/lib/cn";
import type { LeadSource, LeadStatus, TagRef } from "@/modules/crm/domain/types";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_STYLES,
} from "./labels";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        LEAD_STATUS_STYLES[status],
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {LEAD_SOURCE_LABELS[source]}
    </span>
  );
}

export function TagChips({ tags }: { tags: TagRef[] }) {
  if (tags.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t.id}
          className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs"
          style={t.color ? { borderColor: t.color, color: t.color } : undefined}
        >
          {t.name}
        </span>
      ))}
    </div>
  );
}
