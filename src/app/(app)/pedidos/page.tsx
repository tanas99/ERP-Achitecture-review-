import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listOrders, parseOrderFilters } from "@/modules/orders";
import { OrdersList } from "@/modules/orders/ui/orders-list";
import { OrdersToolbar } from "@/modules/orders/ui/orders-toolbar";
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
    return `/pedidos?${params.toString()}`;
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const filters = parseOrderFilters(sp);
  const data = await listOrders(ctx, filters);
  const hasFilters = Boolean(sp.q || sp.status || sp.priority);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Pedidos, pagos y entregas</p>
        </div>
        <Link href="/pedidos/nuevo">
          <Button>Nuevo pedido</Button>
        </Link>
      </div>

      <OrdersToolbar />

      {data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Sin resultados" : "Aún no hay pedidos"}
          description={
            hasFilters
              ? "Prueba ajustando los filtros."
              : "Crea un pedido a partir de una cotización aprobada."
          }
        />
      ) : (
        <>
          <OrdersList items={data.items} />
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} hrefFor={hrefBuilder(sp)} />
        </>
      )}
    </div>
  );
}
