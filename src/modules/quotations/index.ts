/** Quotations module — PUBLIC API (composition root). */
import {
  makeAcceptQuotation,
  makeCreateQuotation,
  makeGetQuotation,
  makeListQuotations,
  makeListQuotationParties,
  makeSetQuotationStatus,
} from "./application/use-cases";
import {
  PrismaQuotationRepository,
  PrismaQuotationDirectoryRepository,
} from "./infrastructure/prisma-quotation-repository";
import { convertLeadToCustomer } from "@/modules/crm";

const repo = new PrismaQuotationRepository();
const dir = new PrismaQuotationDirectoryRepository();

export const createQuotation = makeCreateQuotation(repo);
export const listQuotations = makeListQuotations(repo);
export const getQuotation = makeGetQuotation(repo);
export const setQuotationStatus = makeSetQuotationStatus(repo);
export const acceptQuotation = makeAcceptQuotation(repo, convertLeadToCustomer);
export const listQuotationParties = makeListQuotationParties(dir);

export {
  parseQuotationFilters,
  createQuotationSchema,
  type QuotationFilters,
  type CreateQuotationInput,
} from "./application/forms";
export {
  computeQuotationTotals,
  type QuotationTotals,
} from "./domain/totals";
export {
  QUOTATION_STATUSES,
  type QuotationStatus,
  type QuotationListItem,
  type QuotationDetail,
  type QuotationLineItem,
} from "./domain/types";
