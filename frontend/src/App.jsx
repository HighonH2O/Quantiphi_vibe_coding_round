import { useEffect, useState } from "react";
import {
  createSubscription,
  fetchDashboard,
  updateSubscriptionStatus,
} from "./api/client.js";
import EntryForm from "./components/EntryForm.jsx";
import Header from "./components/Header.jsx";
import MetricsRow from "./components/MetricsRow.jsx";
import SubscriptionGrid from "./components/SubscriptionGrid.jsx";
import { formatDate } from "./lib/format.js";

const EMPTY = {
  currentDate: "",
  subscriptions: [],
  metrics: { monthlyBurnRate: 0, upcomingRenewalsCount: 0 },
};

export default function App() {
  const [dashboard, setDashboard] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard()
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(fields) {
    setSaving(true);
    setError("");
    try {
      const next = await createSubscription(fields);
      setDashboard(next);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id, status) {
    const previous = dashboard;
    setDashboard((current) => ({
      ...current,
      subscriptions: current.subscriptions.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
    setError("");

    try {
      const next = await updateSubscriptionStatus(id, status);
      setDashboard(next);
    } catch (err) {
      setDashboard(previous);
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <Header currentDate={dashboard.currentDate ? formatDate(dashboard.currentDate) : ""} />

      {error ? <div className="alert">{error}</div> : null}

      <MetricsRow metrics={dashboard.metrics} />

      <div className="layout">
        <EntryForm onCreate={handleCreate} busy={saving || loading} />
        <SubscriptionGrid
          subscriptions={dashboard.subscriptions}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
