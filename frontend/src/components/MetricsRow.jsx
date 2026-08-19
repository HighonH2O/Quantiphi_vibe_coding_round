import { formatMoney } from "../lib/format.js";

export default function MetricsRow({ metrics }) {
  const burn = metrics?.monthlyBurnRate ?? 0;
  const upcoming = metrics?.upcomingRenewalsCount ?? 0;

  return (
    <section className="metrics" aria-label="Dashboard metrics">
      <article className="card metric-card">
        <p className="metric-label">Total monthly burn rate</p>
        <p className="metric-value">{formatMoney(burn)}</p>
        <p className="metric-hint">Active subscriptions only, yearly plans divided by 12</p>
      </article>
      <article className="card metric-card">
        <p className="metric-label">Upcoming renewals</p>
        <p className="metric-value">{upcoming}</p>
        <p className="metric-hint">Active plans renewing within 7 days</p>
      </article>
    </section>
  );
}
