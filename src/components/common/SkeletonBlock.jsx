import styles from './SkeletonBlock.module.css';

export default function SkeletonBlock({ height = 120 }) {
  return <div className={styles.skeleton} style={{ height }} />;
}
