import { BellRing } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import styles from './NotificationPanel.module.css';

export default function NotificationPanel() {
  const { notificationPanelOpen, notifications, readNotification } = useAppData();

  return (
    <AnimatePresence>
      {notificationPanelOpen ? (
        <motion.aside
          className={styles.panel}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
        >
          <div className={styles.header}>
            <div>
              <p className="section-eyebrow">Notifications</p>
              <h3>Live system updates</h3>
            </div>
            <BellRing size={18} />
          </div>
          <div className={styles.list}>
            {notifications.length ? (
              notifications.map((item) => (
                <button key={item.id} type="button" className={styles.item} onClick={() => readNotification(item.id)}>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <span>{item.createdAt}</span>
                </button>
              ))
            ) : (
              <div className={styles.empty}>No new updates.</div>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
