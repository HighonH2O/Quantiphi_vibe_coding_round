import { sumMonthlyBurn, toMonthlyRate } from "../engines/costEngine.js";
import {
  daysUntilRenewal,
  getCurrentDate,
  isRenewingSoon,
} from "../engines/dateEngine.js";
import {
  createSubscription as persistSubscription,
  listSubscriptions,
  updateSubscriptionStatus,
} from "../store/subscriptionStore.js";
import { STATUSES } from "../validators/subscriptionValidator.js";

function enrich(subscription, currentDate) {
  const daysRemaining = daysUntilRenewal(subscription.nextRenewalDate, currentDate);

  return {
    ...subscription,
    monthlyCost: toMonthlyRate(subscription.cost, subscription.billingCycle),
    daysRemaining,
    isRenewingSoon: isRenewingSoon(subscription.nextRenewalDate, currentDate),
  };
}

function buildMetrics(enriched) {
  const active = enriched.filter((item) => item.status === STATUSES.ACTIVE);

  return {
    monthlyBurnRate: sumMonthlyBurn(active),
    upcomingRenewalsCount: active.filter((item) => item.isRenewingSoon).length,
  };
}

async function snapshot() {
  const currentDate = getCurrentDate();
  const subscriptions = (await listSubscriptions()).map((item) => enrich(item, currentDate));

  return {
    currentDate,
    subscriptions,
    metrics: buildMetrics(subscriptions),
  };
}

export async function getDashboard() {
  return snapshot();
}

export async function addSubscription(fields) {
  await persistSubscription(fields);
  return snapshot();
}

export async function setSubscriptionStatus(id, status) {
  await updateSubscriptionStatus(id, status);
  return snapshot();
}
