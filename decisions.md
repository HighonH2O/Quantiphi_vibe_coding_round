# Decision log

Every meaningful choice in this repo is recorded here: what was picked, what was rejected, and why.

---

## 2026-08-19 — Split frontend and backend instead of a single Next.js app

**Decision:** Two packages under one root: `backend/` (Express API) and `frontend/` (React + Vite). Root `package.json` only orchestrates both.

**Alternatives:**
- Next.js fullstack (API routes + React in one app)
- Python FastAPI + React
- Single Express app that also serves static HTML

**Why this won:** The problem statement requires server-side business logic and a presentation-only frontend. Separate processes make that boundary obvious for a viva: calculations cannot accidentally live in a React component. Vite is faster to iterate than Next for a small dashboard, and Express maps 1:1 to "this is the server."

**Tradeoff accepted:** Two `npm install`s and a proxy. Rejected Next.js because API routes would blur the "all logic on the server" requirement and add framework surface we do not need.

**Status:** Both packages exist. Root `npm run dev` starts API + Vite.

---

## 2026-08-19 — Express over Fastify / raw Node http

**Decision:** `express@4` with `cors` and `express.json()`.

**Alternatives:** Fastify, raw `node:http`, NestJS.

**Why this won:** Express is the most common interview-readable Node stack. Fastify is faster but adds schema/plugin ceremony. NestJS is too heavy for a timed dashboard. Raw `http` would force us to reimplement JSON parsing and routing.

**Tradeoff accepted:** Express is not the fastest. Clarity for review beats throughput for a personal tracker.

---

## 2026-08-19 — ESM (`"type": "module"`) over CommonJS

**Decision:** Native ES modules (`import` / `export`) in the backend.

**Alternatives:** CommonJS `require`.

**Why this won:** Matches Vite/React on the frontend, avoids dual module styles, and lets Node `--watch` run without a bundler.

**Tradeoff accepted:** Some older snippets use `require`. We write ESM consistently instead.

---

## 2026-08-19 — Pure engines for cost and dates, not calculations in routes

**Decision:** `costEngine.js` owns monthly normalization. A separate `dateEngine.js` will own "days until renewal" and the 7-day urgent window. Routes only parse HTTP and call services.

**Alternatives:** Compute monthly burn and urgency in the React table. Compute inside route handlers.

**Why this won:** The brief says all calculations live on the server. Pure functions are easy to explain: yearly cost `/ 12`, then sum only `active` rows; compare ISO dates to one server "today."

**Tradeoff accepted:** More files. Worth it so the viva can point at one function per rule.

**Status:** Both engines exist and are called only from `subscriptionService.js`.

---

## 2026-08-19 — JSON file store over SQLite / Postgres / in-memory only

**Decision:** Persist subscriptions in `backend/data/subscriptions.json`, gitignored, reseeded if missing.

**Alternatives:**
- In-memory array (lost on restart)
- SQLite
- Postgres / Mongo

**Why this won:** No DB install, still survives a server restart during a demo, and stays easy to inspect. A real DB would dominate the time budget.

**Tradeoff accepted:** Not multi-user safe, no transactions. This is a single-user assessment app.

**Status:** Implemented in `backend/src/store/subscriptionStore.js`. Missing/corrupt file reseeds from relative dates.

---

## 2026-08-19 — Currency rounding to 2 decimals on the server

**Decision:** `Math.round((n + Number.EPSILON) * 100) / 100` inside `toMonthlyRate` and `sumMonthlyBurn`.

**Alternatives:** Keep full IEEE floats; use integer cents; use a money library (`dinero.js`).

**Why this won:** Dashboard money should display as currency. Integer cents are more correct but more code. A money library is overkill for yearly/12.

**Tradeoff accepted:** `659.88 / 12` can still have a half-cent edge case. Good enough for this product; we did not pull in a finance library.

---

## 2026-08-19 — CORS allowlist + Vite proxy (planned)

**Decision:** API listens on port `4000`. Browser app will be on `5173`. Express CORS allowlist those origins. Vite will proxy `/api` to `4000` so the frontend can call `/api/...` without hard-coding hosts.

**Alternatives:** Same origin by serving the built frontend from Express only; wildcard CORS `*`.

**Why this won:** Dev is two processes (matches the architecture). Wildcard CORS is sloppy. Production can later serve `frontend/dist` from Express if needed.

**Status:** CORS in `app.js`. Vite proxy `/api` → `:4000` in `frontend/vite.config.js`.

---

## 2026-08-19 — `concurrently` at the repo root

**Decision:** Root script `npm run dev` runs API and web together.

**Alternatives:** Two terminals; `npm-run-all`; Docker Compose.

**Why this won:** One command for reviewers. Docker is too much ops for this round.

**Status:** Frontend package exists. Root `dev` script is the intended way to run the demo.

---

## 2026-08-19 — Gitignore generated subscription data

**Decision:** Ignore `backend/data/subscriptions.json` so local pause/toggle experiments do not look like source of truth in GitHub.

**Alternatives:** Commit a seed JSON.

**Why this won:** Seed should be generated in code from a relative "today," so "Renewing Soon" still works whenever someone clones the repo.

---

## 2026-08-19 — Manual GitHub push; no agent commit/push

**Decision:** Destination is `https://github.com/HighonH2O/Quantiphi_vibe_coding_round` (already public). The agent must not commit or push unless asked.

**Why this won:** User will push themselves. Avoids accidental history on a timed/public submission repo.

---

## 2026-08-19 — Process files: `decisions.md`, `Flow.md`, quiz gate

**Decision:** These three user rules are always-on Cursor rules plus two markdown files in the repo root.

**Why this won:** The user asked for a durable log of *why*, a map of *what calls what*, and a quiz before a change set is accepted. Rules in `.cursor/rules/` survive new chats; the markdown files are what a human (or viva) can read.

---

## 2026-08-19 — Custom CSS instead of Tailwind / a component library

**Decision:** One `global.css` file. No Tailwind, MUI, Chakra, or shadcn.

**Alternatives:** Tailwind + shadcn (Linear-like speed); MUI (heavy); styled-components.

**Why this won:** The brief asked for a specific light fintech look (one accent, amber only for warnings, muted paused rows). A component library would drag in its own palette and extra dependencies. Custom CSS keeps the bundle two packages (React + Vite) and the visual rules explicit.

**Tradeoff accepted:** No utility-class velocity. Fine at this UI size (one page).

---

## 2026-08-19 — Light dashboard, accent `#1f4fe0`, amber only for warnings

**Decision:** Neutral light background `#f5f6f8`, white cards, hairline borders, Plus Jakarta Sans. Primary actions and the "on" toggle use `#1f4fe0`. "Renewing Soon" is the only amber treatment. Paused rows use muted gray (`#f8fafc` / `#94a3b8`), not a second accent.

**Alternatives:** Dark theme (Linear default); Vercel black buttons as the only accent; green for money.

**Why this won:** The user asked for Linear/Stripe/Vercel *quality* with a light, professional page. A second green for currency would break "one primary accent." Money stays near-black with `tabular-nums`.

**Tradeoff accepted:** Less "finance dashboard green." Clearer hierarchy.

---

## 2026-08-19 — Native `<input type="date">` instead of a calendar library

**Decision:** Browser date picker for Next Renewal Date.

**Alternatives:** react-day-picker, Flatpickr.

**Why this won:** The spec asks for a visual calendar date-picker; the native control is a calendar popup, zero JS, accessible, and matches "frontend is presentation." A date library would add bundle size and another API to explain in viva.

**Tradeoff accepted:** Chrome/Edge/Firefox chrome the picker differently. Acceptable for this app.

---

## 2026-08-19 — One dashboard snapshot per request, not separate /metrics

**Decision:** GET/POST `/api/subscriptions` and PATCH `/api/subscriptions/:id/status` all return `{ currentDate, subscriptions, metrics }`.

**Alternatives:** `GET /metrics` plus `GET /subscriptions`; send only the mutated row.

**Why this won:** Burn rate and upcoming count must stay in lockstep with pause/create. Returning the full snapshot means the React tree never recomputes money. Fewer round-trips after toggle.

**Tradeoff accepted:** Slightly larger JSON. Irrelevant at this scale.

---

## 2026-08-19 — Optimistic grey-out; metrics stay server-authoritative

**Decision:** Toggle immediately flips `status` in React (row greys out). Monthly burn and upcoming count update only after the PATCH snapshot returns. If the request fails, the previous dashboard is restored.

**Alternatives:** Wait for the server before greying; also subtract `monthlyCost` in the browser.

**Why this won:** The vibe check wants an instant visual pause without deleting the row. Recalculating burn in React would duplicate the Cost Uniformity Engine and violate the "logic on the server" rule.

---

## 2026-08-19 — Upcoming-renewal count ignores paused rows

**Decision:** `isRenewingSoon` is still computed for paused items (badge can show, greyed with the row). `upcomingRenewalsCount` counts only `status === "active"`.

**Alternatives:** Count paused urgent rows too; hide the badge when paused.

**Why this won:** The spec ties the alert count to the dashboard metric, and paused plans are not about to be paid. The badge still documents the date math for the viva.

---

## 2026-08-19 — Seed data uses offsets from server today

**Decision:** First load writes Netflix/Spotify/ChatGPT (within 7 days), Adobe/GitHub (later), Notion paused. Dates are `today + n`, not hardcoded calendar days.

**Why this won:** "Renewing Soon" still works whenever a reviewer clones the repo. Data file is gitignored so local toggles do not become the committed seed.

