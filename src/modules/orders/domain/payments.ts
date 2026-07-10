import type { PaymentStatus } from "./types";

/**
 * Pure payment summary (ARCHITECTURE.md §4). Money in integer cents.
 * Derives paid/balance and the payment status from confirmed payments.
 *  - paid <= 0            -> SIN_PAGO
 *  - paid >= total        -> PAGADO_TOTAL
 *  - paid >= 50% of total -> ANTICIPO
 *  - otherwise (e.g. $10) -> RESERVA
 */
export interface PaymentSummary {
  paidCents: number;
  balanceCents: number;
  paymentStatus: PaymentStatus;
}

export function computePaymentSummary(
  totalCents: number,
  payments: { amountCents: number }[],
): PaymentSummary {
  const paidCents = payments.reduce((s, p) => s + p.amountCents, 0);
  const balanceCents = totalCents - paidCents;

  let paymentStatus: PaymentStatus;
  if (paidCents <= 0) paymentStatus = "SIN_PAGO";
  else if (paidCents >= totalCents) paymentStatus = "PAGADO_TOTAL";
  else if (paidCents * 2 >= totalCents) paymentStatus = "ANTICIPO";
  else paymentStatus = "RESERVA";

  return { paidCents, balanceCents, paymentStatus };
}
