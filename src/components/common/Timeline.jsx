import styles from './Timeline.module.css';

export default function Timeline({ items }) {
  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className={styles.step}>
          <span className={styles.dot} />
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}
