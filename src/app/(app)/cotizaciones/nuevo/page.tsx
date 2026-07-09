import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listQuotationParties } from "@/modules/quotations";
import { QuotationForm } from "@/modules/quotations/ui/quotation-form";

export default async function NewQuotationPage() {
  const ctx = await getRequestContext();
  const parties = await listQuotationParties(ctx);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/cotizaciones" className="text-sm text-muted-foreground hover:underline">
          ← Cotizaciones
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nueva cotización</h1>
        <p className="text-sm text-muted-foreground">
          Arma el presupuesto para un lead o cliente
        </p>
      </div>
      <QuotationForm leads={parties.leads} customers={parties.customers} />
    </div>
  );
}
