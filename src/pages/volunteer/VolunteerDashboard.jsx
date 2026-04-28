import { CheckCircle2, Gauge, Route, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LiveFeed from '../../components/common/LiveFeed';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import StatCard from '../../components/common/StatCard';
import { getIssues } from '../../services/issueService';
import { getVolunteerCapacitySnapshot, getVolunteerPerformance } from '../../services/volunteerService';
import styles from './VolunteerDashboard.module.css';

export default function VolunteerDashboard() {
  const auth = useAuth();
  const user = auth?.user;
  const { activeTasks, allIssues: issues, notifications } = useAppData();
  const [capacity, setCapacity] = useState(null);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getVolunteerCapacitySnapshot(), getVolunteerPerformance(user.id)]).then(
      ([capacityData, performanceData]) => {
        setCapacity(capacityData);
        setPerformance(performanceData);
      },
    );
  }, [user]);

  const loading = !issues || !capacity || !performance;

  const recommended = useMemo(
    () => issues.filter((issue) => issue.requiredSkills.some((skill) => user.skills?.includes(skill))),
    [issues, user.skills],
  );

  if (loading) {
    return <SkeletonBlock height={240} />;
  }

  return (
    <div className={styles.page}>
      <section className="grid grid-4">
        <StatCard label="Recommended tasks" value={recommended.length} detail="Based on skill overlap" icon={Sparkles} />
        <StatCard label="Completion rate" value={`${performance.completionRate}%`} detail="Last 30 shifts" icon={CheckCircle2} />
        <StatCard label="Average travel" value={`${user.maxDistance} km`} detail="Volunteer preferred radius" icon={Route} />
        <StatCard label="Readiness" value={capacity.availableNow > 2 ? 'High' : 'Moderate'} detail="Availability and response state" icon={Gauge} />
      </section>

      <section className={styles.matchBoard}>
        <div className={styles.panel}>
          <p className="section-eyebrow">Today&apos;s matched opportunities</p>
          <h3>Best-fit tasks based on your volunteer profile</h3>
          {recommended.slice(0, 4).map((issue) => (
            <article key={issue.id} className={styles.taskRow}>
              <div>
                <strong>{issue.title}</strong>
                <p>{issue.locationName || issue.location?.label} • Needs {issue.requiredSkills.join(', ')}</p>
              </div>
              <span className={`badge badge${issue.priority}`}>{issue.priority}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-2">
        <div className={styles.panel}>
          <p className="section-eyebrow">Volunteer profile intelligence</p>
          <h3>Your performance dashboard</h3>
          <div className={styles.skillRow}>
            {user.skills?.map((skill) => (
              <span key={skill} className={styles.skillChip}>{skill}</span>
            ))}
          </div>
          {capacity ? (
            <div className={styles.capacityGrid}>
              <article><span>Available now</span><strong>{capacity.availableNow}</strong></article>
              <article><span>In field</span><strong>{capacity.inField}</strong></article>
              <article><span>Avg reliability</span><strong>{capacity.avgReliability}%</strong></article>
              <article><span>Completed tasks</span><strong>{performance.completedTasks}</strong></article>
              <article><span>Rating</span><strong>{performance.rating}</strong></article>
              <article><span>Response time</span><strong>{performance.responseTime}</strong></article>
            </div>
          ) : null}
          <div className={styles.queueBanner}>
            <strong>{activeTasks.length}</strong>
            <span>Active or queued tasks in your system view</span>
          </div>
        </div>
        <LiveFeed
          title="Task reminders and route updates"
          items={notifications.slice(0, 5).map((n) => ({
            title: n.title,
            detail: n.message,
            time: n.createdAt || 'just now'
          }))}
        />
      </section>
    </div>
  );
}
