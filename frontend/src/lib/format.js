const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatMoney(value) {
  return money.format(Number(value) || 0);
}

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-").map(Number);
  return dateFmt.format(new Date(year, month - 1, day));
}

export function formatDaysRemaining(days) {
  if (days === null || days === undefined) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  return `In ${days} days`;
}

export function initial(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}
