import { AlertTriangle, Clock3, MapPinned, ScanSearch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import StatCard from '../../components/common/StatCard';
import { getUserIssues } from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';
import styles from './CitizenDashboard.module.css';

function computeAvgResponseMin(issueList) {
  const deltas = issueList
    .map((issue) => {
      const created = issue.createdAt ? new Date(issue.createdAt).getTime() : null;
      const assigned = issue.updates?.find((u) =>
        u.label?.toLowerCase().includes('accepted') ||
        u.label?.toLowerCase().includes('assigned') ||
        u.label?.toLowerCase().includes('transit')
      );
      if (!created || !assigned?.time) return null;
      // updates store time as "HH:MM" — use createdAt date as base
      const [h, m] = assigned.time.split(':').map(Number);
      const base = new Date(issue.createdAt);
      base.setHours(h, m, 0, 0);
      return Math.max(0, (base.getTime() - created) / 60000);
    })
    .filter((d) => d !== null && d < 180); // ignore > 3h outliers
  if (!deltas.length) return 'N/A';
  return `${Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length)} min`;
}

export default function CitizenDashboard() {
  const auth = useAuth();
  const user = auth?.user;
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ INITIAL LOAD
  useEffect(() => {
    getUserIssues(user.name).then((userIssues) => {
      setIssues(userIssues);
      setLoading(false);
    });
  }, [user.name]);

  // ✅ AUTO REFRESH (REAL-TIME FEEL)
  useEffect(() => {
    const interval = setInterval(() => {
      getUserIssues(user.name).then(setIssues);
    }, 5000);

    return () => clearInterval(interval);
  }, [user.name]);

  if (loading) {
    return (
      <div className="grid grid-2">
        <SkeletonBlock height={180} />
        <SkeletonBlock height={180} />
      </div>
    );
  }

  const openIssues = issues.filter((issue) => issue.status !== 'Resolved').length;

  return (
    <div className={styles.page}>
      {/* STATS */}
      <section className="grid grid-4">
        <StatCard label="Reported issues" value={issues.length} detail="User-submitted requests" icon={MapPinned} />
        <StatCard label="Trust score" value={user.trustScore ? `${user.trustScore}%` : 'N/A'} detail="Report accuracy and verification quality" icon={ScanSearch} />
        <StatCard label="Open queues" value={openIssues} detail="Awaiting action or review" icon={AlertTriangle} />
        <StatCard label="Avg. response" value={computeAvgResponseMin(issues)} detail="Based on your reported issues" icon={Clock3} />
      </section>

      {/* ISSUE LIST */}
      <section className="grid grid-2">
        <div className={styles.activityCard}>
          <p className="section-eyebrow">Issue history</p>
          <h3>Your tracked requests</h3>

          {issues.length ? (
            issues.map((issue) => (
              <article key={issue.id} className={styles.issueRow}>
                <div>
                  <strong>{issue.title}</strong>
                  <p>{issue.category} • {issue.priority} priority</p>
                </div>

                <button
                  className={`badge badge${issue.priority}`}
                  onClick={() => navigate(`/user/issues?issueId=${issue.id}`)}
                >
                  Open
                </button>
              </article>
            ))
          ) : (
            <div className={styles.empty}>No issues reported yet.</div>
          )}
        </div>
      </section>

      {/* ✅ REAL USER STATUS PANEL */}
      <section className="grid grid-2">

        {/* STATUS */}
        <div className={styles.activityCard}>
          <p className="section-eyebrow">Live status</p>
          <h3>Your Issue Status</h3>

          {issues.length ? (
            issues.map((issue) => (
              <div key={issue.id} className={styles.issueRow}>
                <div>
                  <strong>{issue.title}</strong>

                  <p>Status: {issue.status}</p>

                  <p>
                    Volunteer: {issue.assignedVolunteer || "Not assigned"} <br />
                    NGO: {issue.assignedNgo || "Not assigned"}
                  </p>

                  <p>ETA: {issue.eta || "Pending"}</p>
                </div>

                <span className={`badge badge${issue.priority}`}>
                  {issue.priority}
                </span>
              </div>
            ))
          ) : (
            <div>No issues yet</div>
          )}
        </div>

        {/* LIVE TIMELINE */}
        <div className={styles.activityCard}>
          <p className="section-eyebrow">Live updates</p>
          <h3>Issue Timeline</h3>

          {issues[0]?.updates?.length ? (
            issues[0].updates.map((u, i) => (
              <div key={i}>
                <strong>{u.label}</strong>
                <p>{u.time}</p>
              </div>
            ))
          ) : (
            <div>No updates yet</div>
          )}
        </div>

      </section>
    </div>
  );
}