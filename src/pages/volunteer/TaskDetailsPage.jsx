import { CheckCircle2, Clock3, MapPin, PlayCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Timeline from '../../components/common/Timeline';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAppData } from '../../context/AppDataContext';
import { getIssueTimeline } from '../../services/issueService';
import { completeTask } from '../../services/volunteerService';
import styles from './TaskDetailsPage.module.css';

function formatValue(value, fallback = 'Not available') {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  return value || fallback;
}

function isVideoUrl(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const auth = useAuth();
  const user = auth?.user;
  const { pushToast } = useNotifications();
  const { activeTasks = [], allIssues = [] } = useAppData();
  const [timeline, setTimeline] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const task = useMemo(
    () => activeTasks.find((item) => item.id === taskId || item.issueId === taskId) || null,
    [activeTasks, taskId],
  );

  const issue = useMemo(
    () => allIssues.find((item) => item.id === task?.issueId || item.id === taskId) || null,
    [allIssues, task?.issueId, taskId],
  );

  useEffect(() => {
    if (!issue?.id) return;
    getIssueTimeline(issue.id).then(setTimeline).catch(() => setTimeline(issue.updates || []));
  }, [issue?.id, issue?.updates]);

  const assignedToCurrentVolunteer = task?.volunteerId === user?.id;
  const canComplete = Boolean(task && assignedToCurrentVolunteer && task.status === 'accepted');
  const statusLabel = task?.status || issue?.status || 'Pending Review';
  const locationLabel = issue?.locationName || issue?.location?.label;
  const distanceLabel = issue?.distanceKm ? `${issue.distanceKm} km` : 'Not available';

  const routeHint = useMemo(() => {
    if (!issue) return '';
    if (!locationLabel) return 'Location details are not available yet. Check with the NGO before moving.';
    return `Proceed to ${locationLabel}. Distance: ${distanceLabel}.`;
  }, [distanceLabel, issue, locationLabel]);

  const handleComplete = async () => {
    if (!canComplete) return;
    setSubmitting(true);
    try {
      await completeTask(task.id, issue.id, user.name);
      pushToast({
        title: 'Task completed',
        message: `${issue.title} has been marked resolved.`,
        type: 'success',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!issue && activeTasks.length === 0 && allIssues.length === 0) {
    return <SkeletonBlock height={240} />;
  }

  if (!issue) {
    return (
      <section className={styles.card}>
        <p className="section-eyebrow">Task unavailable</p>
        <h3>This task is no longer in your active queue.</h3>
        <p className={styles.muted}>It may have been reassigned, declined, or resolved by the NGO.</p>
        <Link to="/volunteer/matching" className="primaryButton">Back to matching</Link>
      </section>
    );
  }

  return (
    <div className="grid grid-2">
      <section className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <p className="section-eyebrow">{issue.id}</p>
            <h3>{issue.title}</h3>
          </div>
          <span className={`badge badge${issue.priority}`}>{issue.priority}</span>
        </div>

        <p className={styles.description}>{issue.description}</p>

        <div className={styles.metaGrid}>
          <article><MapPin size={16} /><span>Location</span><strong>{formatValue(locationLabel)}</strong></article>
          <article><Clock3 size={16} /><span>Distance</span><strong>{distanceLabel}</strong></article>
          <article><UserCheck size={16} /><span>Skills needed</span><strong>{formatValue(issue.requiredSkills)}</strong></article>
          <article><ShieldCheck size={16} /><span>Status</span><strong>{statusLabel}</strong></article>
        </div>

        {issue.mediaUrls?.length > 0 ? (
          <div className={styles.mediaContainer}>
            <p className="section-eyebrow">Media attachments</p>
            <div className={styles.mediaGrid}>
              {issue.mediaUrls.map((url) => (
                isVideoUrl(url) ? (
                  <video key={url} src={url} controls className={styles.mediaItem} />
                ) : (
                  <img key={url} src={url} className={styles.mediaItem} alt="Issue attachment" />
                )
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.executionCard}>
          <div>
            <p className="section-eyebrow">Execution flow</p>
            <strong>{routeHint}</strong>
            {!assignedToCurrentVolunteer && task ? (
              <p>This task is assigned to another volunteer, so completion is locked for your account.</p>
            ) : null}
            {!task ? <p>The issue is visible, but no active task record is linked to you yet.</p> : null}
          </div>
          <div className={styles.actionRow}>
            <button type="button" className="primaryButton" onClick={handleComplete} disabled={!canComplete || submitting}>
              {statusLabel === 'completed' || statusLabel === 'Resolved' ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
              {submitting ? 'Completing...' : statusLabel === 'completed' || statusLabel === 'Resolved' ? 'Completed' : 'Mark completed'}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <p className="section-eyebrow">Task timeline</p>
        <h3>Operational progress</h3>
        {timeline.length ? (
          <Timeline items={timeline.map((item) => `${item.label} (${item.time})`)} />
        ) : (
          <p className={styles.muted}>No timeline updates yet.</p>
        )}
        <div className={styles.executionCard}>
          <ShieldCheck size={18} />
          <div>
            <strong>Coordination state</strong>
            <p>{task?.reminderAt ? `Next reminder at ${task.reminderAt}` : `Current task state: ${statusLabel}.`}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
