import logo from '../../assets/sewa-logo.png';
import { NavLink } from 'react-router-dom';
import { Activity, BookOpen, Briefcase, ClipboardList, Gauge, HeartHandshake, LocateFixed, PanelsTopLeft, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const navMap = {
  user: [
    { label: 'Dashboard', to: '/user/dashboard', icon: Gauge },
    { label: 'Report Issue', to: '/user/report', icon: ClipboardList },
    { label: 'Track Issues', to: '/user/issues', icon: LocateFixed },
    { label: 'Resource Hub', to: '/user/resources', icon: BookOpen },
  ],
  volunteer: [
    { label: 'Dashboard', to: '/volunteer/dashboard', icon: Gauge },
    { label: 'Smart Matching', to: '/volunteer/matching', icon: Activity },
    { label: 'Availability', to: '/volunteer/availability', icon: UsersRound },
  ],
  ngo: [
    { label: 'Dashboard', to: '/ngo/dashboard', icon: PanelsTopLeft },
    { label: 'Issue Management', to: '/ngo/issues', icon: Briefcase },
    { label: 'Smart Allocation', to: '/ngo/allocation', icon: HeartHandshake },
    { label: 'Volunteer Network', to: '/ngo/network', icon: UsersRound },
  ],
};

export default function Sidebar() {
  const auth = useAuth();
  const user = auth?.user;
  const items = navMap[user.role];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <img src={logo} alt="Sewa Logo"  />
        </div>
        <div>
          <p className={styles.eyebrow}>Data-driven coordination</p>
          <h1>Sewa</h1>
        </div>
      </div>
      <div className={styles.roleCard}>
        <span className={styles.roleLabel}>{user.role}</span>
        <strong>{user.name}</strong>
        <p>{user.organization || user.organizationType || 'Unified response network'}</p>
      </div>
      <nav className={styles.nav}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
