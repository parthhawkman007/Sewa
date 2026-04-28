import { Bell, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import SearchBar from '../common/SearchBar';
import ThemeToggle from '../common/ThemeToggle';
import styles from './Navbar.module.css';

const pageTitles = {
  '/user/dashboard': 'User Coordination View',
  '/user/report': 'Report New Issue',
  '/user/issues': 'Issue Tracking',
  '/user/resources': 'Resource Hub',
  '/volunteer/dashboard': 'Volunteer Operations',
  '/volunteer/matching': 'Smart Task Matching',
  '/volunteer/availability': 'Availability Planner',
  '/ngo/dashboard': 'NGO Operations Dashboard',
  '/ngo/issues': 'Issue Management Center',
  '/ngo/allocation': 'Smart Allocation Console',
  '/ngo/network': 'Volunteer Network',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { notifications, setNotificationPanelOpen, notificationPanelOpen, activeTasks } = useAppData();

  return (
    <motion.header className={styles.navbar} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <p className={styles.breadcrumb}>Operational intelligence</p>
        <h2>{pageTitles[pathname] || 'Smart Resource Allocation'}</h2>
      </div>
      <div className={styles.actions}>
        <SearchBar />
        <button type="button" className={styles.iconWrap} onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}>
          <Bell size={18} />
          <span>{notifications.filter((item) => !item.read).length}</span>
        </button>
        <ThemeToggle />
        <button type="button" className={styles.logoutButton} onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </motion.header>
  );
}
