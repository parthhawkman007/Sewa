import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import styles from './ToastViewport.module.css';

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

export default function ToastViewport() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className={styles.viewport}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          return (
            <motion.button
              key={toast.id}
              type="button"
              className={styles.toast}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              onClick={() => dismissToast(toast.id)}
            >
              <Icon size={18} />
              <div>
                <strong>{toast.title}</strong>
                <p>{toast.message}</p>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
