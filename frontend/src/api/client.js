const headers = { "Content-Type": "application/json" };

async function parse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

export function fetchDashboard() {
  return fetch("/api/subscriptions").then(parse);
}

export function createSubscription(fields) {
  return fetch("/api/subscriptions", {
    method: "POST",
    headers,
    body: JSON.stringify(fields),
  }).then(parse);
}

export function updateSubscriptionStatus(id, status) {
  return fetch(`/api/subscriptions/${id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  }).then(parse);
}
