# Execution flow

How a request travels through this repo: files, functions, and order.

**Current session focus:** `README.md` only. No runtime path changed. Reviewers start at the README, then `npm run dev` as in Boot below.

---

## Boot

```
npm run dev                          (root package.json)
  concurrently
    backend: node --watch src/index.js
      index.js
        createApp()                  app.js
        app.listen(4000)
    frontend: vite                   frontend/vite.config.js
      browser http://localhost:5173
      proxy /api -> http://localhost:4000
```

---

## Load dashboard

```
1. App.jsx  useEffect
     fetchDashboard()                frontend/src/api/client.js
       GET /api/subscriptions

2. Vite proxy -> Express
     app.js  cors, express.json
     subscriptionRouter              backend/src/routes/subscriptions.js
       GET /
         getDashboard()              backend/src/services/subscriptionService.js
           listSubscriptions()       backend/src/store/subscriptionStore.js
             read JSON or seed relative to today
           enrich() each row
             toMonthlyRate()         costEngine.js
             daysUntilRenewal()      dateEngine.js
             isRenewingSoon()        dateEngine.js  (0..7 days vs server today)
           buildMetrics()
             sumMonthlyBurn(active only)
             count(active && isRenewingSoon)

3. JSON { currentDate, subscriptions, metrics }
     App.jsx setDashboard
       Header                        currentDate (display only)
       MetricsRow                    metrics.monthlyBurnRate, upcomingRenewalsCount
       SubscriptionGrid              table rows, badge, toggle
```

Nothing in React computes burn or the 7-day flag. It only renders fields the API already set.

---

## Add subscription

```
1. EntryForm.jsx  handleSubmit
     onCreate(fields)                App.jsx handleCreate
       POST /api/subscriptions       { name, cost, billingCycle, nextRenewalDate }

2. routes/subscriptions.js POST /
     validateCreatePayload()         subscriptionValidator.js
     addSubscription(fields)         subscriptionService.js
       persistSubscription()         subscriptionStore.js  (status always "active")
       snapshot()                    same enrich + metrics as GET

3. 201 + full dashboard JSON
     App.jsx replaces state
     form resets
```

---

## Pause / resume (vibe check)

```
1. SubscriptionGrid ToggleSwitch click
     onStatusChange(id, "paused" | "active")
       App.jsx handleStatusChange
         optimistic: only the row's status changes (instant grey-out)
         PATCH /api/subscriptions/:id/status  { status }

2. routes/subscriptions.js PATCH /:id/status
     validateStatusPayload()
     setSubscriptionStatus()
       updateSubscriptionStatus()    store: mutate status, NEVER delete
       snapshot()                    paused excluded from monthlyBurnRate

3. JSON dashboard replaces React state
     metrics update from the server
     on failure, previous state is restored
```

---

## Files involved in this session

| File | Role in the path |
|------|------------------|
| `frontend/src/App.jsx` | Owns dashboard state; calls API |
| `frontend/src/components/EntryForm.jsx` | Collects raw fields |
| `frontend/src/components/MetricsRow.jsx` | Displays server metrics |
| `frontend/src/components/SubscriptionGrid.jsx` | Table, badge, toggle |
| `frontend/src/api/client.js` | GET/POST/PATCH |
| `backend/src/routes/subscriptions.js` | HTTP entry |
| `backend/src/services/subscriptionService.js` | Enrich + metrics |
| `backend/src/engines/costEngine.js` | Yearly → monthly |
| `backend/src/engines/dateEngine.js` | Days remaining / urgent window |
| `backend/src/store/subscriptionStore.js` | JSON persist + seed |

---

## What this session modified

The missing router and the entire frontend were added so the path above is live, not planned. `costEngine.js` is now imported from `subscriptionService.js` (it was unused before).
