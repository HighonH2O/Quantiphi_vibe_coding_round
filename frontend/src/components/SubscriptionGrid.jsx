import { formatDate, formatDaysRemaining, formatMoney, initial } from "../lib/format.js";

function ToggleSwitch({ checked, label, onToggle }) {
  return (
    <button
      type="button"
      className="toggle"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
    >
      <span className="switch" />
      {label}
    </button>
  );
}

export default function SubscriptionGrid({ subscriptions, onStatusChange }) {
  if (!subscriptions?.length) {
    return (
      <section className="card panel">
        <h2>Active subscriptions</h2>
        <p className="empty">No subscriptions yet. Add one to see burn and renewals.</p>
      </section>
    );
  }

  return (
    <section className="card panel">
      <h2>Subscriptions</h2>
      <p className="panel-copy">Paused rows stay in the list and drop out of monthly burn.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Cost</th>
              <th>Cycle</th>
              <th>Next renewal</th>
              <th>Alert</th>
              <th className="toggle-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((item) => {
              const paused = item.status === "paused";
              return (
                <tr key={item.id} className={paused ? "is-paused" : undefined}>
                  <td>
                    <div className="service">
                      <div className="avatar">{initial(item.name)}</div>
                      <span className="service-name">{item.name}</span>
                    </div>
                  </td>
                  <td className="cost">{formatMoney(item.cost)}</td>
                  <td className="cycle">{item.billingCycle}</td>
                  <td>
                    <span className="renewal-date">{formatDate(item.nextRenewalDate)}</span>
                    <span className="renewal-meta">{formatDaysRemaining(item.daysRemaining)}</span>
                  </td>
                  <td>
                    {item.isRenewingSoon ? (
                      <span className="badge">Renewing Soon</span>
                    ) : (
                      <span className="muted-dash">—</span>
                    )}
                  </td>
                  <td className="toggle-cell">
                    <ToggleSwitch
                      checked={!paused}
                      label={paused ? "Paused" : "Active"}
                      onToggle={() => onStatusChange(item.id, paused ? "active" : "paused")}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
