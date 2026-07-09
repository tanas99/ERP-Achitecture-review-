import { getRequestContext } from "@/server/auth/context";

/**
 * Dashboard shell. The dashboard engine (ARCHITECTURE.md §23) will compose
 * role-based metric widgets here in a later milestone; for the Foundation we
 * render the authenticated shell so the app is navigable end-to-end.
 */
export default async function DashboardPage() {
  const ctx = await getRequestContext();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Panel</h1>
      <p className="text-muted-foreground">
        Bienvenida a tu ERP. Aquí verás tus indicadores clave.
      </p>
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Sesión activa · empresa <code>{ctx.companyId}</code>
      </div>
    </div>
  );
}
