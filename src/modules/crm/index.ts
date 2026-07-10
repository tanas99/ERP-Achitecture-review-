/**
 * CRM module — PUBLIC API. Other modules and the app layer import ONLY from here
 * (ARCHITECTURE.md §2/§3). This file wires the concrete Prisma repositories into
 * the application use cases (composition root for the module).
 */
import {
  makeAddCustomerAddress,
  makeAddCustomerNote,
  makeAddCustomerTag,
  makeAddLeadActivity,
  makeAssignLead,
  makeChangeLeadStatus,
  makeConvertLeadToCustomer,
  makeCreateLead,
  makeGetCustomer,
  makeGetLead,
  makeListCustomers,
  makeListLeads,
  makeListOptions,
  makeRemoveCustomerTag,
  makeUpdateCustomer,
  makeUpdateLead,
} from "./application/use-cases";
import { PrismaLeadRepository } from "./infrastructure/prisma-lead-repository";
import { PrismaCustomerRepository } from "./infrastructure/prisma-customer-repository";
import { PrismaDirectoryRepository } from "./infrastructure/prisma-directory-repository";

const leadRepo = new PrismaLeadRepository();
const customerRepo = new PrismaCustomerRepository();
const directoryRepo = new PrismaDirectoryRepository();

export const listLeads = makeListLeads(leadRepo);
export const listCustomers = makeListCustomers(customerRepo);
export const listCrmOptions = makeListOptions(directoryRepo);
export const getLead = makeGetLead(leadRepo);
export const createLead = makeCreateLead(leadRepo);
export const updateLead = makeUpdateLead(leadRepo);
export const addLeadActivity = makeAddLeadActivity(leadRepo);
export const changeLeadStatus = makeChangeLeadStatus(leadRepo);
export const assignLead = makeAssignLead(leadRepo);
export const convertLeadToCustomer = makeConvertLeadToCustomer(leadRepo);
export const getCustomer = makeGetCustomer(customerRepo);
export const updateCustomer = makeUpdateCustomer(customerRepo);
export const addCustomerAddress = makeAddCustomerAddress(customerRepo);
export const addCustomerNote = makeAddCustomerNote(customerRepo);
export const addCustomerTag = makeAddCustomerTag(customerRepo);
export const removeCustomerTag = makeRemoveCustomerTag(customerRepo);

export {
  parseLeadFilters,
  parseCustomerFilters,
  type LeadFilters,
  type CustomerFilters,
} from "./application/filters";
export {
  createLeadSchema,
  updateLeadSchema,
  addActivitySchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type AddActivityInput,
} from "./application/lead-forms";
export {
  addAddressSchema,
  addNoteSchema,
  updateCustomerSchema,
  IDENTIFICATION_TYPES,
  type AddAddressInput,
  type AddNoteInput,
  type UpdateCustomerInput,
} from "./application/customer-forms";
export type {
  LeadListItem,
  LeadDetail,
  LeadActivityItem,
  CustomerListItem,
  CustomerDetail,
  CustomerAddressItem,
  CustomerNoteItem,
  CustomerTimelineItem,
  CustomerTimelineType,
  IdentificationType,
  LeadStatus,
  LeadSource,
  LeadActivityType,
  LostReason,
  TagRef,
  AssignedUser,
  Paginated,
} from "./domain/types";
export {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_ACTIVITY_TYPES,
  LOST_REASONS,
} from "./domain/types";
