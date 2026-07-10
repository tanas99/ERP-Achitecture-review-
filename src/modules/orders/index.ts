/** Orders module — PUBLIC API (composition root). */
import {
  makeCreateOrderFromQuotation,
  makeGetOrder,
  makeListOrders,
  makeListOrderableQuotations,
  makeRegisterPayment,
  makeSetOrderStatus,
  makeUpdateDelivery,
} from "./application/use-cases";
import {
  PrismaOrderRepository,
  PrismaOrderableQuotationRepository,
} from "./infrastructure/prisma-order-repository";

const repo = new PrismaOrderRepository();
const quoteRepo = new PrismaOrderableQuotationRepository();

export const createOrderFromQuotation = makeCreateOrderFromQuotation(repo);
export const listOrders = makeListOrders(repo);
export const getOrder = makeGetOrder(repo);
export const registerPayment = makeRegisterPayment(repo);
export const setOrderStatus = makeSetOrderStatus(repo);
export const updateDelivery = makeUpdateDelivery(repo);
export const listOrderableQuotations = makeListOrderableQuotations(quoteRepo);

export { parseOrderFilters, type OrderFilters } from "./application/forms";
export { computePaymentSummary } from "./domain/payments";
export {
  ORDER_STATUSES,
  ORDER_PRIORITIES,
  PAYMENT_TIERS,
  PAYMENT_METHODS,
  DELIVERY_TYPES,
  DELIVERY_STATUSES,
  EVENT_TYPES,
  type OrderStatus,
  type OrderPriority,
  type OrderListItem,
  type OrderDetail,
} from "./domain/types";
