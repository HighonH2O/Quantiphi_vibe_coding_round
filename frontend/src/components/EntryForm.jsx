import { useState } from "react";

const EMPTY = {
  name: "",
  cost: "",
  billingCycle: "Monthly",
  nextRenewalDate: "",
};

export default function EntryForm({ onCreate, busy }) {
  const [fields, setFields] = useState(EMPTY);
  const [localError, setLocalError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!fields.name.trim() || !fields.cost || !fields.nextRenewalDate) {
      setLocalError("Fill in service name, cost, and renewal date.");
      return;
    }

    try {
      await onCreate({
        name: fields.name.trim(),
        cost: Number(fields.cost),
        billingCycle: fields.billingCycle,
        nextRenewalDate: fields.nextRenewalDate,
      });
      setFields(EMPTY);
    } catch (error) {
      setLocalError(error.message);
    }
  }

  return (
    <section className="card panel">
      <h2>Add a subscription</h2>
      <p className="panel-copy">Track a SaaS or streaming plan. Yearly costs are normalized on the server.</p>

      {localError ? <div className="alert">{localError}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Service name</label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={80}
            placeholder="Netflix"
            value={fields.name}
            onChange={update}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="cost">Cost</label>
          <div className="currency-field">
            <span>$</span>
            <input
              id="cost"
              name="cost"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="15.99"
              value={fields.cost}
              onChange={update}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="billingCycle">Billing cycle</label>
          <select
            id="billingCycle"
            name="billingCycle"
            value={fields.billingCycle}
            onChange={update}
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="nextRenewalDate">Next renewal date</label>
          <input
            id="nextRenewalDate"
            name="nextRenewalDate"
            type="date"
            value={fields.nextRenewalDate}
            onChange={update}
          />
        </div>

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add subscription"}
        </button>
      </form>
    </section>
  );
}
