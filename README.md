# Subscription Tracker & Renewal Dashboard

Personal finance dashboard for recurring SaaS and streaming subscriptions. Add plans, see **monthly burn**, and flag renewals in the next **7 days**. Pausing a row does not delete it — it greys out and drops that cost from burn so you can simulate savings.

**Live source:** [github.com/HighonH2O/Quantiphi_vibe_coding_round](https://github.com/HighonH2O/Quantiphi_vibe_coding_round)

## Features

- Entry form: service name, currency cost, Monthly/Yearly cycle, calendar renewal date
- Metrics: total monthly burn rate, upcoming-renewals count
- Table with **Renewing Soon** (amber) when renewal is within 7 days
- Active / Paused toggle — row stays in the list; paused cost is excluded from burn
- All money, date, and validation logic runs on the **server**

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Persistence | JSON file (`backend/data/subscriptions.json`, gitignored) |

## Run locally

Requires **Node.js 18+**.

```bash
cd Quantiphi
npm install
npm run install:all
npm run dev
```

| App | URL |
| --- | --- |
| Dashboard | http://localhost:5173 |
| API | http://localhost:4000 |

Vite proxies `/api` to the Express server.

## Architecture

```
Browser (presentation)
  EntryForm / MetricsRow / SubscriptionGrid
        |
        |  GET/POST /api/subscriptions
        |  PATCH /api/subscriptions/:id/status
        v
Express routes → validator → subscriptionService
                    |              |
                    |         costEngine  (yearly ÷ 12)
                    |         dateEngine  (days until renewal, 0–7 window)
                    v
              subscriptionStore (JSON)
```

Every mutating request returns a full dashboard **snapshot**: `{ currentDate, subscriptions, metrics }`. The UI does not recompute burn or urgency.

More detail: [`Flow.md`](./Flow.md). Why these choices: [`decisions.md`](./decisions.md).

## API

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| `GET` | `/api/subscriptions` | — | Dashboard snapshot |
| `POST` | `/api/subscriptions` | `{ name, cost, billingCycle, nextRenewalDate }` | Created + snapshot (`201`) |
| `PATCH` | `/api/subscriptions/:id/status` | `{ status: "active" \| "paused" }` | Snapshot; row is never deleted |

`billingCycle` must be `"Monthly"` or `"Yearly"`. `nextRenewalDate` is `YYYY-MM-DD`.

## Notes

- First API start **seeds** sample subscriptions with dates relative to server today, so “Renewing Soon” still works after a clone.
- Paused rows can still show the badge; they do **not** count toward upcoming renewals.
- Do not commit `.env` files or `backend/data/subscriptions.json`.
