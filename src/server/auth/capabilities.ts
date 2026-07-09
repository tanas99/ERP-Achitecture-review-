/**
 * RBAC capabilities & permission matrix (ARCHITECTURE.md §6).
 * Permissions are capability strings "<resource>:<action>". Roles map to a set
 * of capabilities. The application layer is the authoritative enforcement point.
 */
export const ROLES = [
  "ADMINISTRADOR",
  "VENTAS",
  "PRODUCCION",
  "MARKETING",
  "CONTABILIDAD",
  "REPARTIDOR",
] as const;

export type Role = (typeof ROLES)[number];

// MVP capabilities. Extend as later modules land.
export const CAPABILITIES = [
  "leads:read",
  "leads:write",
  "customers:read",
  "customers:write",
  "quotations:read",
  "quotations:write",
  "orders:read",
  "orders:write",
  "payments:read",
  "payments:write",
  "production:read",
  "production:update-status",
  "delivery:read",
  "delivery:update",
  "calendar:read",
  "dashboard:view",
  "users:manage",
  "settings:manage",
  "feature-flags:manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/**
 * Role -> capabilities. Administrador implicitly has everything (handled in
 * `authorize`). Others get an explicit least-privilege set.
 */
export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  ADMINISTRADOR: CAPABILITIES, // full access
  VENTAS: [
    "leads:read",
    "leads:write",
    "customers:read",
    "customers:write",
    "quotations:read",
    "quotations:write",
    "orders:read",
    "orders:write",
    "payments:read",
    "payments:write",
    "production:read",
    "delivery:read",
    "calendar:read",
    "dashboard:view",
  ],
  PRODUCCION: [
    "orders:read",
    "production:read",
    "production:update-status",
    "calendar:read",
    "dashboard:view",
  ],
  MARKETING: ["leads:read", "customers:read", "calendar:read", "dashboard:view"],
  CONTABILIDAD: [
    "orders:read",
    "payments:read",
    "payments:write",
    "dashboard:view",
  ],
  REPARTIDOR: ["delivery:read", "delivery:update", "dashboard:view"],
};
