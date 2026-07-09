import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listQuotations, parseQuotationFilters } from "@/modules/quotations";
import { QuotationsList } from "@/modules/quotations/ui/quotations-list";
import { QuotationsToolbar } from "@/modules/quotations/ui/quotations-toolbar";
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
    return `/cotizaciones?${params.toString()}`;
  };
}

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const filters = parseQuotationFilters(sp);
  const data = await listQuotations(ctx, filters);
  const hasFilters = Boolean(sp.q || sp.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">Presupuestos para leads y clientes</p>
        </div>
        <Link href="/cotizaciones/nuevo">
          <Button>Nueva cotización</Button>
        </Link>
      </div>

      <QuotationsToolbar />

      {data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay cotizaciones"}
          description={
            hasFilters
              ? "Prueba ajustando el estado o la búsqueda."
              : "Crea tu primera cotización para un lead o cliente."
          }
        />
      ) : (
        <>
          <QuotationsList items={data.items} />
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
