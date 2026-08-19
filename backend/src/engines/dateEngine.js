const URGENT_WINDOW_DAYS = 7;

/**
 * Date Intersect Calculator
 * Renewal urgency is always measured against one server-side current date.
 * The browser never decides whether a row is "Renewing Soon".
 */
export function getCurrentDate() {
  return toIsoDate(new Date());
}

export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(isoDate) {
  if (typeof isoDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }

  const [year, month, day] = isoDate.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function daysUntilRenewal(renewalIsoDate, currentIsoDate) {
  const renewal = parseIsoDate(renewalIsoDate);
  const current = parseIsoDate(currentIsoDate);

  if (!renewal || !current) {
    return null;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((renewal.getTime() - current.getTime()) / msPerDay);
}

export function isRenewingSoon(renewalIsoDate, currentIsoDate) {
  const remaining = daysUntilRenewal(renewalIsoDate, currentIsoDate);
  return remaining !== null && remaining >= 0 && remaining <= URGENT_WINDOW_DAYS;
}

export function addDays(isoDate, days) {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }
  parsed.setDate(parsed.getDate() + days);
  return toIsoDate(parsed);
}

export { URGENT_WINDOW_DAYS };
