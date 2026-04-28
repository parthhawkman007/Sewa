import { getNgoDashboardMetrics, getNgoAnalytics } from '../../services/ngoService';
import { AlertCircle, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LiveFeed from '../../components/common/LiveFeed';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import StatCard from '../../components/common/StatCard';
import { StatusDonut, TrendLine } from '../../components/common/DonutChart';
import { useAppData } from '../../context/AppDataContext';
import styles from './NgoDashboard.module.css';

export default function NgoDashboard() {
  const { allIssues: issues, notifications } = useAppData();
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([getNgoDashboardMetrics(), getNgoAnalytics()])
      .then(([metricRes, analyticsRes]) => {
        console.log("METRICS RAW:", metricRes);
        console.log("ANALYTICS RAW:", analyticsRes);

        setMetrics(metricRes);
        setAnalytics(analyticsRes);
      })
      .catch((err) => {
        console.error("NGO Dashboard Error:", err);
      });
  }, []);

  const statusData = useMemo(() => {
    const open = (issues || []).filter((issue) => issue.status === 'Open' || issue.status === 'Pending Review').length;
    const progress = (issues || []).filter((issue) => issue.status === 'In Progress').length;
    const resolved = (issues || []).filter((issue) => issue.status === 'Resolved').length;
    return {
      labels: ['Open', 'In Progress', 'Resolved'],
      values: [open, progress, resolved]
    };
  }, [issues]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const issueTrendValues = (analytics?.issueTrend || []).slice(0, 6);
  const responseValues = (analytics?.responseTimes || []).slice(0, 6);

  if (!metrics || !analytics) return <SkeletonBlock height={240} />;

  return (
    <div className={styles.page}>
      {/* 🔥 STATS */}
      <section className="grid grid-4">
        <StatCard label="Active issues" value={issues.length} detail="Cross-district intake volume" icon={AlertCircle} />
        <StatCard label="High priority" value={metrics?.alerts || 0} detail="Needs rapid allocation" icon={TrendingUp} />
        <StatCard label="Live responses" value={issues.filter((issue) => issue.status === 'In Progress').length} detail="Tasks already dispatched" icon={Users} />
        <StatCard label="Allocation health" value={`${metrics?.completionRate || 0}%`} detail="Capacity used efficiently" icon={BarChart3} />
      </section>

      {/* 🔥 DONUT */}
      <section className="grid grid-1">
        <div className={`${styles.sectionCard} ${styles.centeredCard}`}>
          <h3>Issue status mix</h3>

          <div className={styles.donutWrapper}>
            <StatusDonut data={statusData} />
          </div>
        </div>
      </section>

      {/* 🔥 LIVE FEED ONLY (HeatMatrix removed) */}
      <section className="grid grid-1">
        <LiveFeed
          title="Control center feed"
          items={(notifications || []).slice(0, 5).map((n, i) => ({
            id: n.id || i,
            title: n.title,
            detail: n.message,
            time: n.createdAt || 'just now'
          }))}
        />
      </section>

      {/* 🔥 CHARTS */}
      <section className="grid grid-2">
        <TrendLine
          labels={days}
          values={issueTrendValues.length ? issueTrendValues : [0, 0, 0, 0, 0, 0]}
          title="Issue trends"
        />

        <TrendLine
          labels={days}
          values={responseValues.length ? responseValues : [0, 0, 0, 0, 0, 0]}
          title="Average response time"
        />
      </section>
    </div>
  );
}