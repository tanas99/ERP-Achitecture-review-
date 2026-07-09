"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { AssignedUser, LeadStatus } from "@/modules/crm/domain/types";
import { LEAD_STATUSES } from "@/modules/crm/domain/types";
import { LEAD_STATUS_LABELS } from "./labels";
import { changeLeadStatusAction, assignLeadAction } from "@/app/(app)/leads/actions";

/**
 * Inline quick actions per lead row: change status, (re)assign salesperson.
 * Uses native selects for accessibility; calls server actions and refreshes.
 */
export function LeadQuickActions({
  leadId,
  status,
  assignedToId,
  users,
}: {
  leadId: string;
  status: LeadStatus;
  assignedToId: string | null;
  users: AssignedUser[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <Select
        aria-label="Cambiar estado"
        defaultValue={status}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            await changeLeadStatusAction(leadId, e.target.value as LeadStatus);
            router.refresh();
          })
        }
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Asignar vendedora"
        defaultValue={assignedToId ?? ""}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            await assignLeadAction(leadId, e.target.value || null);
            router.refresh();
          })
        }
      >
        <option value="">Sin asignar</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
