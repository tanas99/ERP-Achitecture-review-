import type { RequestContext } from "@/server/context";
import type {
  AssignedUser,
  CustomerDetail,
  CustomerListItem,
  LeadDetail,
  LeadListItem,
  LeadStatus,
  Paginated,
  TagRef,
} from "@/modules/crm/domain/types";
import type { LeadFilters, CustomerFilters } from "./filters";
import type {
  AddActivityInput,
  CreateLeadInput,
  UpdateLeadInput,
} from "./lead-forms";
import type {
  AddAddressInput,
  AddNoteInput,
  UpdateCustomerInput,
} from "./customer-forms";

/**
 * Repository ports (interfaces). Infrastructure implements them with Prisma.
 * All methods are tenant-scoped via the RequestContext (companyId).
 */
export interface LeadRepository {
  list(
    ctx: RequestContext,
    filters: LeadFilters,
  ): Promise<Paginated<LeadListItem>>;
  findById(ctx: RequestContext, leadId: string): Promise<LeadDetail | null>;
  create(ctx: RequestContext, input: CreateLeadInput): Promise<string>;
  update(
    ctx: RequestContext,
    leadId: string,
    input: UpdateLeadInput,
  ): Promise<void>;
  addActivity(
    ctx: RequestContext,
    leadId: string,
    input: AddActivityInput,
  ): Promise<void>;
  updateStatus(
    ctx: RequestContext,
    leadId: string,
    status: LeadStatus,
  ): Promise<void>;
  assign(
    ctx: RequestContext,
    leadId: string,
    userId: string | null,
  ): Promise<void>;
}

export interface CustomerRepository {
  list(
    ctx: RequestContext,
    filters: CustomerFilters,
  ): Promise<Paginated<CustomerListItem>>;
  findById(ctx: RequestContext, customerId: string): Promise<CustomerDetail | null>;
  updateInfo(
    ctx: RequestContext,
    customerId: string,
    input: UpdateCustomerInput,
  ): Promise<void>;
  addAddress(
    ctx: RequestContext,
    customerId: string,
    input: AddAddressInput,
  ): Promise<void>;
  addNote(
    ctx: RequestContext,
    customerId: string,
    input: AddNoteInput,
  ): Promise<void>;
  addTag(ctx: RequestContext, customerId: string, tagId: string): Promise<void>;
  removeTag(ctx: RequestContext, customerId: string, tagId: string): Promise<void>;
}

export interface DirectoryRepository {
  /** Sales-people that leads can be assigned to (VENTAS / ADMINISTRADOR). */
  assignableUsers(ctx: RequestContext): Promise<AssignedUser[]>;
  /** Tags available for the company (for the customer tag filter). */
  tags(ctx: RequestContext): Promise<TagRef[]>;
}
