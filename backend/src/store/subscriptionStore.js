import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addDays, getCurrentDate } from "../engines/dateEngine.js";
import { BILLING_CYCLES } from "../engines/costEngine.js";
import { STATUSES } from "../validators/subscriptionValidator.js";
import { HttpError } from "../utils/httpError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "subscriptions.json");

function seedSubscriptions(today) {
  const rows = [
    {
      name: "Netflix",
      cost: 15.99,
      billingCycle: BILLING_CYCLES.MONTHLY,
      nextRenewalDate: addDays(today, 3),
      status: STATUSES.ACTIVE,
    },
    {
      name: "Spotify Premium",
      cost: 10.99,
      billingCycle: BILLING_CYCLES.MONTHLY,
      nextRenewalDate: addDays(today, 1),
      status: STATUSES.ACTIVE,
    },
    {
      name: "ChatGPT Plus",
      cost: 20,
      billingCycle: BILLING_CYCLES.MONTHLY,
      nextRenewalDate: addDays(today, 6),
      status: STATUSES.ACTIVE,
    },
    {
      name: "Adobe Creative Cloud",
      cost: 659.88,
      billingCycle: BILLING_CYCLES.YEARLY,
      nextRenewalDate: addDays(today, 21),
      status: STATUSES.ACTIVE,
    },
    {
      name: "GitHub Copilot",
      cost: 100,
      billingCycle: BILLING_CYCLES.YEARLY,
      nextRenewalDate: addDays(today, 45),
      status: STATUSES.ACTIVE,
    },
    {
      name: "Notion Plus",
      cost: 10,
      billingCycle: BILLING_CYCLES.MONTHLY,
      nextRenewalDate: addDays(today, 12),
      status: STATUSES.PAUSED,
    },
  ];

  return rows.map((row) => ({
    id: randomUUID(),
    ...row,
    createdAt: new Date().toISOString(),
  }));
}

async function persist(subscriptions) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify({ subscriptions }, null, 2), "utf8");
}

async function load() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.subscriptions)) {
      throw new Error("Invalid store shape");
    }
    return parsed.subscriptions;
  } catch (error) {
    if (error && error.code !== "ENOENT" && error.message !== "Invalid store shape") {
      console.warn("Subscription store reset:", error.message);
    }
    const seeded = seedSubscriptions(getCurrentDate());
    await persist(seeded);
    return seeded;
  }
}

export async function listSubscriptions() {
  return load();
}

export async function createSubscription(fields) {
  const subscriptions = await load();
  const record = {
    id: randomUUID(),
    ...fields,
    status: STATUSES.ACTIVE,
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(record);
  await persist(subscriptions);
  return record;
}

export async function updateSubscriptionStatus(id, status) {
  const subscriptions = await load();
  const index = subscriptions.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new HttpError(404, "Subscription not found.");
  }

  subscriptions[index] = {
    ...subscriptions[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  await persist(subscriptions);
  return subscriptions[index];
}
