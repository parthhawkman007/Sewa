import { PhoneCall, ShieldPlus, TentTree, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import LiveFeed from '../../components/common/LiveFeed';
import { getUserResourceRecommendations, getResourceAlerts } from '../../services/issueService';
import styles from './UserResourcesPage.module.css';

const ICON_MAP = { PhoneCall, TentTree, ShieldPlus, Truck };

const DEFAULT_QUICK_ACTIONS = [
  { label: 'Emergency hotline', value: '108', icon: 'PhoneCall' },
  { label: 'Nearest shelter', value: 'Checking...', icon: 'TentTree' },
  { label: 'Medical relay', value: 'Checking...', icon: 'ShieldPlus' },
  { label: 'Supply drop points', value: 'Checking...', icon: 'Truck' },
];

export default function UserResourcesPage() {
  const [resources, setResources] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [quickActions, setQuickActions] = useState(DEFAULT_QUICK_ACTIONS);

  // Real-time Firestore listener for quick action status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'quickActions'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setQuickActions(
          DEFAULT_QUICK_ACTIONS.map((item) => ({
            ...item,
            value: data[item.label] ?? item.value,
          }))
        );
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await getUserResourceRecommendations();
      const alertsRes = await getResourceAlerts();
      setResources(res || []);
      setAlerts(alertsRes || []);
    } catch (err) {
      console.error('Resource fetch error:', err);
    }
  };

  return (
    <div className={styles.page}>
      <section className="grid grid-4">
        {quickActions.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <article key={item.label} className={styles.quickCard}>
              {Icon && <Icon size={18} />}
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          );
        })}
      </section>

      <section className="grid grid-2">
        <div className={styles.resourcePanel}>
          <p className="section-eyebrow">Recommended support</p>
          <h3>Nearby resources matched to your issue</h3>

          <div className={styles.resourceList}>
            {resources.length ? (
              resources.map((resource) => (
                <article key={resource.id} className={styles.resourceCard}>
                  <div>
                    <strong>{resource.title}</strong>
                    <p>{resource.type}</p>
                  </div>
                  <span>{resource.eta}</span>
                  <small>{resource.note}</small>
                </article>
              ))
            ) : (
              <p>No resources available yet</p>
            )}
          </div>
        </div>

        <LiveFeed
          title="Resource alerts"
          items={
            alerts.length
              ? alerts
              : [{ title: 'No updates yet', detail: '', time: '' }]
          }
        />
      </section>
    </div>
  );
}