import { getRequestContext } from "@/server/auth/context";
import { listLeads, listCrmOptions, parseLeadFilters } from "@/modules/crm";
import { LeadsToolbar } from "@/modules/crm/ui/leads-toolbar";
import { LeadsList } from "@/modules/crm/ui/leads-list";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

type SP = Record<string, string | string[] | undefined>;

function hrefBuilder(sp: SP) {
  return (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== "page") params.set(k, v);
    }
    params.set("page", String(page));
    return `/leads?${params.toString()}`;
  };
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const filters = parseLeadFilters(sp);
  const [data, options] = await Promise.all([
    listLeads(ctx, filters),
    listCrmOptions(ctx),
  ]);

  const hasFilters = Boolean(sp.q || sp.status || sp.source || sp.assignedToId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Interesados en tu embudo de ventas
          </p>
        </div>
        <Link href="/leads/nuevo">
          <Button>Nuevo lead</Button>
        </Link>
      </div>

      <LeadsToolbar users={options.assignableUsers} />

      {data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay leads"}
          description={
            hasFilters
              ? "Prueba ajustando los filtros o la búsqueda."
              : "Cuando registres interesados de Instagram, WhatsApp, referidos y más, aparecerán aquí."
          }
        />
      ) : (
        <>
          <LeadsList items={data.items} users={options.assignableUsers} />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            hrefFor={hrefBuilder(sp)}
          />
        </>
      )}
    </div>
  );
}
