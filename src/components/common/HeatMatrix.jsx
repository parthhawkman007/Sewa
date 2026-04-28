import styles from './HeatMatrix.module.css';

export default function HeatMatrix({ issues = [] }) {
  const zones = [
    { label: 'North', x: '18%', y: '22%' },
    { label: 'East', x: '75%', y: '30%' },
    { label: 'Central', x: '48%', y: '52%' },
    { label: 'South', x: '30%', y: '78%' },
  ];

  const getZoneIntensity = (zoneLabel) => {
    const relevant = issues.filter((issue) => {
      if (!issue || !issue.location) return false;

      // Case 1: location is a string
      if (typeof issue.location === "string") {
        return issue.location.toLowerCase().includes(zoneLabel.toLowerCase());
      }

      // Case 2: location object with zone (BEST PRACTICE)
      if (issue.location.zone) {
        return issue.location.zone.toLowerCase() === zoneLabel.toLowerCase();
      }

      // Case 3: location object with city fallback
      if (issue.location.city) {
        return issue.location.city.toLowerCase().includes(zoneLabel.toLowerCase());
      }

      return false;
    });

    if (relevant.some((issue) => issue.priority === 'High')) return 'high';
    if (relevant.some((issue) => issue.priority === 'Medium')) return 'medium';
    return relevant.length ? 'low' : 'idle';
  };

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className="section-eyebrow">Demand concentration</p>
          <h3>Heat matrix</h3>
        </div>
      </div>

      <div className={styles.canvas}>
        {zones.map((zone) => {
          const intensity = getZoneIntensity(zone.label);

          return (
            <article
              key={zone.label}
              className={`${styles.zone} ${styles[intensity]}`}
              style={{ left: zone.x, top: zone.y }}
            >
              <strong>{zone.label}</strong>
              <span>{intensity}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}