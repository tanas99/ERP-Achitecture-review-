import { describe, it, expect } from "vitest";
import { computePaymentSummary } from "./payments";

describe("computePaymentSummary", () => {
  const total = 10000; // $100

  it("SIN_PAGO with no payments", () => {
    const s = computePaymentSummary(total, []);
    expect(s.paidCents).toBe(0);
    expect(s.balanceCents).toBe(10000);
    expect(s.paymentStatus).toBe("SIN_PAGO");
  });

  it("RESERVA for a $10 reservation", () => {
    const s = computePaymentSummary(total, [{ amountCents: 1000 }]);
    expect(s.paymentStatus).toBe("RESERVA");
    expect(s.balanceCents).toBe(9000);
  });

  it("ANTICIPO at 50%", () => {
    const s = computePaymentSummary(total, [{ amountCents: 5000 }]);
    expect(s.paymentStatus).toBe("ANTICIPO");
    expect(s.balanceCents).toBe(5000);
  });

  it("PAGADO_TOTAL when fully paid (in parts)", () => {
    const s = computePaymentSummary(total, [
      { amountCents: 1000 },
      { amountCents: 4000 },
      { amountCents: 5000 },
    ]);
    expect(s.paidCents).toBe(10000);
    expect(s.balanceCents).toBe(0);
    expect(s.paymentStatus).toBe("PAGADO_TOTAL");
  });

  it("PAGADO_TOTAL even if overpaid (balance negative)", () => {
    const s = computePaymentSummary(total, [{ amountCents: 12000 }]);
    expect(s.paymentStatus).toBe("PAGADO_TOTAL");
    expect(s.balanceCents).toBe(-2000);
  });
});
