/** Quotations module — PUBLIC API (composition root). */
import {
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

const repo = new PrismaQuotationRepository();
const dir = new PrismaQuotationDirectoryRepository();

export const createQuotation = makeCreateQuotation(repo);
export const listQuotations = makeListQuotations(repo);
export const getQuotation = makeGetQuotation(repo);
export const setQuotationStatus = makeSetQuotationStatus(repo);
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
