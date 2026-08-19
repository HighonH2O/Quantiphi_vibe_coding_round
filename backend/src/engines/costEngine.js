const BILLING_CYCLES = Object.freeze({
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
});

export { BILLING_CYCLES };

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/**
 * Cost Uniformity Engine
 * Normalizes any billing cycle into a comparable monthly burn figure.
 */
export function toMonthlyRate(cost, billingCycle) {
  const amount = Number(cost);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (billingCycle === BILLING_CYCLES.YEARLY) {
    return roundCurrency(amount / 12);
  }

  return roundCurrency(amount);
}

export function sumMonthlyBurn(subscriptions) {
  return roundCurrency(
    subscriptions.reduce((total, item) => total + toMonthlyRate(item.cost, item.billingCycle), 0)
  );
}
