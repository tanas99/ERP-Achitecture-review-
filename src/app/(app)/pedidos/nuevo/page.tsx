import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listOrderableQuotations } from "@/modules/orders";
import { CreateOrderForm } from "@/modules/orders/ui/create-order-form";

export default async function NewOrderPage() {
  const ctx = await getRequestContext();
  const quotations = await listOrderableQuotations(ctx);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/pedidos" className="text-sm text-muted-foreground hover:underline">
          ← Pedidos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nuevo pedido</h1>
        <p className="text-sm text-muted-foreground">
          A partir de una cotización aprobada
        </p>
      </div>
      <CreateOrderForm quotations={quotations} />
    </div>
  );
}
