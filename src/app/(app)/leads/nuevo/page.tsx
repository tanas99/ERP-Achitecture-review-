import Link from "next/link";
import { getRequestContext } from "@/server/auth/context";
import { listCrmOptions } from "@/modules/crm";
import { LeadForm } from "@/modules/crm/ui/lead-form";

export default async function NewLeadPage() {
  const ctx = await getRequestContext();
  const options = await listCrmOptions(ctx);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/leads" className="text-sm text-muted-foreground hover:underline">
          ← Leads
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nuevo lead</h1>
        <p className="text-sm text-muted-foreground">
          Registra un interesado en tu embudo de ventas
        </p>
      </div>
      <LeadForm mode={{ kind: "create" }} users={options.assignableUsers} />
    </div>
  );
}
