import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestContext } from "@/server/auth/context";
import { getLead, listCrmOptions } from "@/modules/crm";
import { NotFoundError } from "@/modules/shared/domain/errors";
import { StatusBadge, SourceBadge } from "@/modules/crm/ui/badges";
import { LeadQuickActions } from "@/modules/crm/ui/lead-quick-actions";
import { LeadForm } from "@/modules/crm/ui/lead-form";
import { AddActivityForm } from "@/modules/crm/ui/add-activity-form";
import { ActivityTimeline } from "@/modules/crm/ui/activity-timeline";
import { formatDate, formatDateTime, LOST_REASON_LABELS } from "@/modules/crm/ui/labels";

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getRequestContext();
  const { id } = await params;

  let lead;
  try {
    lead = await getLead(ctx, id);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const options = await listCrmOptions(ctx);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/leads" className="text-sm text-muted-foreground hover:underline">
            ← Leads
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            {lead.name} <StatusBadge status={lead.status} />
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <SourceBadge source={lead.source} />
            <span>· Registrado {formatDate(lead.createdAt)}</span>
          </div>
        </div>
        <LeadQuickActions
          leadId={lead.id}
          status={lead.status}
          assignedToId={lead.assignedTo?.id ?? null}
          users={options.assignableUsers}
        />
      </div>

      {lead.convertedCustomerId && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          Convertido en cliente el {formatDate(lead.convertedAt)}.{" "}
          <Link href="/clientes" className="underline">
            Ver clientes
          </Link>
        </div>
      )}
      {lead.status === "PERDIDO" && lead.lostReason && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm">
          Perdido — {LOST_REASON_LABELS[lead.lostReason]}
          {lead.lostReasonNote ? `: ${lead.lostReasonNote}` : ""}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: activity */}
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Registrar contacto</h2>
            <AddActivityForm leadId={lead.id} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Historial</h2>
              <span className="text-xs text-muted-foreground">
                Último contacto: {formatDateTime(lead.lastContactAt)}
              </span>
            </div>
            <ActivityTimeline items={lead.activities} />
          </div>
        </section>

        {/* Right: edit form */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Ficha del lead</h2>
          <LeadForm
            mode={{ kind: "edit", leadId: lead.id }}
            users={options.assignableUsers}
            defaults={{
              name: lead.name,
              source: lead.source,
              status: lead.status,
              phone: lead.phone ?? "",
              email: lead.email ?? "",
              socialHandle: lead.socialHandle ?? "",
              referredBy: lead.referredBy ?? "",
              assignedToId: lead.assignedTo?.id ?? "",
              nextFollowUpAt: toDateInput(lead.nextFollowUpAt),
              notes: lead.notes ?? "",
            }}
          />
        </section>
      </div>
    </div>
  );
}
