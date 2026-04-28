import styles from './LiveFeed.module.css';

export default function LiveFeed({ title = 'Live coordination feed', items }) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <p className="section-eyebrow">Real-time simulation</p>
        <h3>{title}</h3>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={styles.item}>
            <div className={styles.marker} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.time}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
