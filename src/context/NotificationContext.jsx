import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
let nextId = 1000;

export function NotificationProvider({ children }) {
  const auth = useAuth();
const user = auth?.user;
  const [toasts, setToasts] = useState([]);

  const pushToast = ({ title, message, type = 'info' }) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  // Real-time listener for "notifications" collection
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('role', 'in', ['all', user.role]),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Avoid pushing toast for old notifications on initial load
          const isRecent = (Date.now() - new Date(data.timestamp || Date.now()).getTime()) < 5000;
          if (isRecent || !data.read) {
            pushToast({
              title: data.title,
              message: data.message,
              type: data.type || 'info'
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  const value = useMemo(() => ({ toasts, pushToast, dismissToast }), [toasts]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
