import styles from './MapPreview.module.css';

const colorMap = { High: '#EF4444', Medium: '#F59E0B', Low: '#22C55E' };

export default function MapPreview({ issues, title = 'Issue distribution map' }) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className="section-eyebrow">Map simulation</p>
          <h3>{title}</h3>
        </div>
        <div className={styles.legend}>
          {Object.entries(colorMap).map(([label, color]) => (
            <span key={label}>
              <i style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.map}>
        <div className={styles.gridOverlay} />
        {issues.map((issue) => (
          <button
            key={issue.id}
            className={styles.pin}
            style={{ left: `${issue.coordinates.x}%`, top: `${issue.coordinates.y}%`, background: colorMap[issue.priority] }}
            title={`${issue.title} - ${issue.priority}`}
          >
            <span>{issue.id}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
