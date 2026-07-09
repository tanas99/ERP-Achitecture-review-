import { cn } from "@/lib/cn";
import type { QuotationStatus } from "@/modules/quotations/domain/types";
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_STYLES } from "./labels";

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        QUOTATION_STATUS_STYLES[status],
      )}
    >
      {QUOTATION_STATUS_LABELS[status]}
    </span>
  );
}
