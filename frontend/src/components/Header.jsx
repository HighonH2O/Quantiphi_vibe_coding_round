export default function Header({ currentDate }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          S
        </div>
        <div>
          <h1>Subscription Tracker</h1>
          <p>Recurring spend, renewals, and pause simulations</p>
        </div>
      </div>
      {currentDate ? <div className="as-of">As of {currentDate}</div> : null}
    </header>
  );
}
