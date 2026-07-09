/**
 * Pure quotation totals calculation (ARCHITECTURE.md §4). Money in integer cents.
 * Tax (IVA) percentage comes from configurable data, never hardcoded.
 */
export interface LineInput {
  quantity: number;
  unitPriceCents: number;
}

export interface ComputedLine extends LineInput {
  lineTotalCents: number;
}

export interface QuotationTotals {
  lines: ComputedLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeQuotationTotals(
  items: LineInput[],
  taxPercent: number,
): QuotationTotals {
  const lines: ComputedLine[] = items.map((it) => ({
    quantity: it.quantity,
    unitPriceCents: it.unitPriceCents,
    lineTotalCents: it.unitPriceCents * it.quantity,
  }));
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const taxCents = Math.round((subtotalCents * taxPercent) / 100);
  const totalCents = subtotalCents + taxCents;
  return { lines, subtotalCents, taxCents, totalCents };
}
