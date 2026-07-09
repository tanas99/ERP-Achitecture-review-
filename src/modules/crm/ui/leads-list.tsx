import Link from "next/link";
import type { AssignedUser, LeadListItem } from "@/modules/crm/domain/types";
import { StatusBadge, SourceBadge } from "./badges";
import { LeadQuickActions } from "./lead-quick-actions";
import { formatDate } from "./labels";

/**
 * Responsive leads list: a table on >=md screens, stacked cards on mobile.
 */
export function LeadsList({
  items,
  users,
}: {
  items: LeadListItem[];
  users: AssignedUser[];
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Fuente</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Vendedora</th>
              <th className="px-4 py-2 font-medium">Próx. seguimiento</th>
              <th className="px-4 py-2 font-medium">Acciones rápidas</th>
            </tr>
          </thead>
          <tbody>
            {items.map((lead) => (
              <tr key={lead.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {lead.phone ?? lead.email ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">{lead.assignedTo?.name ?? "—"}</td>
                <td className="px-4 py-3">{formatDate(lead.nextFollowUpAt)}</td>
                <td className="px-4 py-3">
                  <LeadQuickActions
                    leadId={lead.id}
                    status={lead.status}
                    assignedToId={lead.assignedTo?.id ?? null}
                    users={users}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {items.map((lead) => (
          <li
            key={lead.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium hover:underline"
                >
                  {lead.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {lead.phone ?? lead.email ?? "—"}
                </div>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <SourceBadge source={lead.source} />
              <span>· {lead.assignedTo?.name ?? "Sin asignar"}</span>
            </div>
            <div className="mt-3">
              <LeadQuickActions
                leadId={lead.id}
                status={lead.status}
                assignedToId={lead.assignedTo?.id ?? null}
                users={users}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
