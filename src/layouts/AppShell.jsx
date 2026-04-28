import { AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import ChatDock from '../components/common/ChatDock';
import NotificationPanel from '../components/common/NotificationPanel';
import PageTransition from '../components/common/PageTransition';
import ToastViewport from '../components/common/ToastViewport';
import styles from './AppShell.module.css';

export default function AppShell() {
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentArea}>
        <Navbar />
        <main className={styles.mainContent}>
          <AnimatePresence mode="wait">
            <PageTransition pageKey={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <NotificationPanel />
      <ChatDock />
      <ToastViewport />
    </div>
  );
}
