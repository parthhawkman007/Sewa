import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

export default function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className={styles.topRow}>
        <div>
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
        {Icon ? (
          <div className={styles.iconWrap}>
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      <span>{detail}</span>
    </motion.div>
  );
}
