import { BILLING_CYCLES } from "../engines/costEngine.js";
import { parseIsoDate } from "../engines/dateEngine.js";
import { HttpError } from "../utils/httpError.js";

const STATUSES = Object.freeze({
  ACTIVE: "active",
  PAUSED: "paused",
});

export { STATUSES };

export function validateCreatePayload(body) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Request body is required.");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    throw new HttpError(400, "Service name is required (max 80 characters).");
  }

  const cost = Number(body.cost);
  if (!Number.isFinite(cost) || cost <= 0 || cost > 1_000_000) {
    throw new HttpError(400, "Cost must be a number greater than 0.");
  }

  const billingCycle = body.billingCycle;
  if (billingCycle !== BILLING_CYCLES.MONTHLY && billingCycle !== BILLING_CYCLES.YEARLY) {
    throw new HttpError(400, "Billing cycle must be Monthly or Yearly.");
  }

  const nextRenewalDate = body.nextRenewalDate;
  if (!parseIsoDate(nextRenewalDate)) {
    throw new HttpError(400, "Next renewal date must be a valid calendar date.");
  }

  return {
    name,
    cost: Math.round((cost + Number.EPSILON) * 100) / 100,
    billingCycle,
    nextRenewalDate,
  };
}

export function validateStatusPayload(body) {
  const status = body?.status;
  if (status !== STATUSES.ACTIVE && status !== STATUSES.PAUSED) {
    throw new HttpError(400, "Status must be active or paused.");
  }
  return status;
}
