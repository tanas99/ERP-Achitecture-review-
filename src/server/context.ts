import type { Role } from "@/server/auth/capabilities";

/**
 * RequestContext — resolved on every protected request from the Auth.js session.
 * Feeds authorization (§6) and the tenant guard (§4). All data access must be
 * scoped by `companyId`.
 */
export interface RequestContext {
  userId: string;
  companyId: string;
  roles: Role[];
}
