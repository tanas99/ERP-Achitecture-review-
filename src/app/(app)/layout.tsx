import { getRequestContext } from "@/server/auth/context";
import { can } from "@/server/auth/authorize";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/nav";
import { AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOutAction } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getRequestContext();
  const items = NAV_ITEMS.filter((item) => can(ctx, item.requires));
  const roleLabel = ctx.roles.map((r) => ROLE_LABELS[r]).join(", ");

  return (
    <div className="flex min-h-screen gap-4 p-4">
      {/* Sidebar — role-based navigation (rounded card) */}
      <aside className="hidden w-56 shrink-0 rounded-[var(--radius)] border border-border bg-card p-4 md:block">
        <div className="mb-6 px-3">
          <p className="text-lg font-bold">Tana&apos;s Bakery</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">ERP</p>
        </div>
        <AppNav items={items} />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="flex h-14 items-center justify-between rounded-full border border-border bg-card px-5">
          <span className="text-sm text-muted-foreground">{roleLabel}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit">
                Salir
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
