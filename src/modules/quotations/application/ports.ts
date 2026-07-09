import type { RequestContext } from "@/server/context";
import type {
  QuotationDetail,
  QuotationListItem,
  QuotationStatus,
} from "@/modules/quotations/domain/types";
import type { CreateQuotationInput, QuotationFilters } from "./forms";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuotationRepository {
  create(ctx: RequestContext, input: CreateQuotationInput): Promise<string>;
  list(
    ctx: RequestContext,
    filters: QuotationFilters,
  ): Promise<Paginated<QuotationListItem>>;
  findById(
    ctx: RequestContext,
    quotationId: string,
  ): Promise<QuotationDetail | null>;
  setStatus(
    ctx: RequestContext,
    quotationId: string,
    status: QuotationStatus,
  ): Promise<void>;
}

/** Party (lead/customer) options for the create form. */
export interface QuotationDirectoryRepository {
  leadOptions(ctx: RequestContext): Promise<{ id: string; name: string }[]>;
  customerOptions(ctx: RequestContext): Promise<{ id: string; name: string }[]>;
}
