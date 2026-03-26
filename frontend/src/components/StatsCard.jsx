export default function StatsCard({ title, value, subtitle }) {
  return (
    <div className="stats-card">
      <div>
        <p className="stats-label">{title}</p>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
