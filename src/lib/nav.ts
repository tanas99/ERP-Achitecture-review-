import type { Role } from "@/server/auth/capabilities";
import type { Capability } from "@/server/auth/capabilities";

/**
 * Role-based navigation (ARCHITECTURE.md §8). Each item declares the capability
 * required to see it; the shell filters items by the user's capabilities so
 * every role lands on a view relevant to them. UI hiding is UX only — the real
 * check is server-side.
 */
export interface NavItem {
  label: string;
  href: string;
  requires: Capability;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Panel", href: "/dashboard", requires: "dashboard:view" },
  { label: "Leads", href: "/leads", requires: "leads:read" },
  { label: "Clientes", href: "/clientes", requires: "customers:read" },
  { label: "Cotizaciones", href: "/cotizaciones", requires: "quotations:read" },
  { label: "Pedidos", href: "/pedidos", requires: "orders:read" },
  { label: "Producción", href: "/produccion", requires: "production:read" },
  { label: "Entregas", href: "/entregas", requires: "delivery:read" },
  { label: "Calendario", href: "/calendario", requires: "calendar:read" },
  { label: "Usuarios", href: "/usuarios", requires: "users:manage" },
  { label: "Configuración", href: "/configuracion", requires: "settings:manage" },
];

export const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRADOR: "Administrador",
  VENTAS: "Ventas",
  PRODUCCION: "Producción",
  MARKETING: "Marketing",
  CONTABILIDAD: "Contabilidad",
  REPARTIDOR: "Repartidor",
};
