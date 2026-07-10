import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listProduction, parseProductionFilters } from "@/modules/production";
import { ProductionBoard } from "@/modules/production/ui/board";
import { EmptyState } from "@/components/ui/empty-state";

type SP = Record<string, string | string[] | undefined>;

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const ctx = await getRequestContext();
  const sp = await searchParams;
  const filters = parseProductionFilters({ includeFinished: sp.includeFinished });
  const items = await listProduction(ctx, filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Producción</h1>
          <p className="text-sm text-muted-foreground">Tablero de la cocina</p>
        </div>
        <Link
          href={filters.includeFinished ? "/produccion" : "/produccion?includeFinished=1"}
          className="text-sm text-primary hover:underline"
        >
          {filters.includeFinished ? "Ocultar finalizados" : "Mostrar finalizados"}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No hay órdenes en producción"
          description="Cuando confirmes un pedido, su orden de producción aparecerá aquí."
        />
      ) : (
        <ProductionBoard items={items} includeFinished={filters.includeFinished} />
      )}
    </div>
  );
}
