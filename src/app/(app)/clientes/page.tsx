import { getRequestContext } from "@/server/auth/context";
import { listCustomers, listCrmOptions, parseCustomerFilters } from "@/modules/crm";
import { CustomersToolbar } from "@/modules/crm/ui/customers-toolbar";
import { CustomersList } from "@/modules/crm/ui/customers-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

type SP = Record<string, string | string[] | undefined>;

function hrefBuilder(sp: SP) {
  return (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== "page") params.set(k, v);
    }
    params.set("page", String(page));
    return `/clientes?${params.toString()}`;
  };
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const filters = parseCustomerFilters(sp);
  const [data, options] = await Promise.all([
    listCustomers(ctx, filters),
    listCrmOptions(ctx),
  ]);

  const hasFilters = Boolean(sp.q || sp.tagId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Clientes con al menos un pedido confirmado o pago
        </p>
      </div>

      <CustomersToolbar tags={options.tags} />

      {data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay clientes"}
          description={
            hasFilters
              ? "Prueba ajustando los filtros o la búsqueda."
              : "Un lead se convierte en cliente al aceptar su primera cotización o pagar. Aparecerán aquí."
          }
        />
      ) : (
        <>
          <CustomersList items={data.items} tags={options.tags} />
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
