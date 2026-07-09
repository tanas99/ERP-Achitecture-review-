/**
 * Money — value object. Amounts are stored as INTEGER CENTS (USD) to avoid
 * floating-point rounding errors (ARCHITECTURE.md §4). Immutable and non-negative
 * by construction for balances; arithmetic returns new instances.
 */
export class Money {
  private constructor(public readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error(`Money must be an integer number of cents, got ${cents}`);
    }
    return new Money(cents);
  }

  /** Parse a decimal amount like 12.5 -> 1250 cents. Rounds to nearest cent. */
  static fromAmount(amount: number): Money {
    return new Money(Math.round(amount * 100));
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  /** Multiply by a whole quantity (e.g. line total = unit price * qty). */
  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity)) {
      throw new Error(`Quantity must be an integer, got ${quantity}`);
    }
    return new Money(this.cents * quantity);
  }

  /** Percentage of this amount, rounded to nearest cent (e.g. 50% deposit, 15% IVA). */
  percentage(percent: number): Money {
    return new Money(Math.round((this.cents * percent) / 100));
  }

  isNegative(): boolean {
    return this.cents < 0;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  greaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  /** Format as USD for es-EC display. */
  format(): string {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(this.cents / 100);
  }
}
