import { useEffect, useState } from 'react';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import Timeline from '../../components/common/Timeline';
import { useAuth } from '../../context/AuthContext';
import { getIssueHistory, pollIssueUpdates } from '../../services/issueService';
import styles from './TrackIssuesPage.module.css';

export default function TrackIssuesPage() {
  const auth = useAuth();
const user = auth?.user;
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIssueHistory(user.name).then((data) => {
      setIssues(data);
      setLoading(false);
    });
  }, [user.name]);

  useEffect(() => {
    if (!issues.length) return undefined;
    const interval = window.setInterval(async () => {
      const updated = await Promise.all(issues.map(async (issue) => (await pollIssueUpdates(issue.id)).issue));
      setIssues(updated);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [issues]);

  if (loading) {
    return <SkeletonBlock height={220} />;
  }

  return (
    <div className={styles.wrapper}>
      {issues.length ? (
        issues.map((issue) => (
          <article key={issue.id} className={styles.card}>
            <div className={styles.header}>
              <div>
                <p className="section-eyebrow">{issue.id}</p>
                <h3>{issue.title}</h3>
              </div>
              <span className={`badge badge${issue.priority}`}>{issue.priority}</span>
            </div>
            <p className={styles.meta}>{issue.category} • {issue.locationName || issue.location?.label} • {issue.createdAt}</p>
            <Timeline items={issue.updates.map((update) => `${update.label} (${update.time})`)} />
          </article>
        ))
      ) : (
        <article className={styles.card}>No issue history available yet.</article>
      )}
    </div>
  );
}
