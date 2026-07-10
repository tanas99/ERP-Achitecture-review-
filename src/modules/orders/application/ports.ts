import type { RequestContext } from "@/server/context";
import type {
  OrderDetail,
  OrderListItem,
  OrderStatus,
} from "@/modules/orders/domain/types";
import type {
  CreateOrderFromQuotationInput,
  OrderFilters,
  RegisterPaymentInput,
  UpdateDeliveryInput,
} from "./forms";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderRepository {
  createFromQuotation(
    ctx: RequestContext,
    input: CreateOrderFromQuotationInput,
  ): Promise<string>;
  list(ctx: RequestContext, filters: OrderFilters): Promise<Paginated<OrderListItem>>;
  findById(ctx: RequestContext, orderId: string): Promise<OrderDetail | null>;
  registerPayment(
    ctx: RequestContext,
    orderId: string,
    input: RegisterPaymentInput,
  ): Promise<void>;
  setStatus(
    ctx: RequestContext,
    orderId: string,
    status: OrderStatus,
    reason: string | null,
  ): Promise<void>;
  updateDelivery(
    ctx: RequestContext,
    orderId: string,
    input: UpdateDeliveryInput,
  ): Promise<void>;
}

/** Approved quotations that don't yet have an order (create entry point). */
export interface OrderableQuotationRepository {
  approvedWithoutOrder(
    ctx: RequestContext,
  ): Promise<{ id: string; number: number; customerName: string; totalCents: number }[]>;
}
