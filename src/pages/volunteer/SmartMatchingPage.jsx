import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { computeMatch } from '../../intelligence/matchingEngine';
import { acceptTask, declineTask } from '../../services/volunteerService';
import styles from './SmartMatchingPage.module.css';

export default function SmartMatchingPage() {
  const auth = useAuth();
  const user = auth?.user;
  const { allIssues, activeTasks: tasks, setActiveTasks } = useAppData();
  const [filters, setFilters] = useState({ distance: 15, skillOnly: false, priority: 'All' });
  const [savedTasks, setSavedTasks] = useState([]);

  const issues = allIssues || [];
  const visibleTasks = tasks || [];
  const queue = visibleTasks.filter((task) => task.status === 'queued');
  const loading = !allIssues || !tasks;

  const matches = useMemo(() => {
    return issues
      .map((issue) => {
        const task = visibleTasks.find((item) => item.issueId === issue.id);
        return {
          issue,
          task,
          isAssignedToMe: task?.volunteerId === user.id || task?.volunteerName === user.name,
          ...computeMatch(issue, {
            id: user.id,
            skills: user.skills || [],
            distanceKm: issue.distanceKm,
            reliability: 92,
          }),
        };
      })
      .filter((match) => match.distanceKm <= filters.distance)
      .filter((match) => (filters.skillOnly ? match.skillScore > 0 : true))
      .filter((match) => (filters.priority === 'All' ? true : match.priority === filters.priority))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [filters, issues, user.id, user.name, user.skills, visibleTasks]);

  if (loading) return <SkeletonBlock height={220} />;

  const handleAccept = async (match) => {
    if (!match.task) return;
    const task = await acceptTask(match.task.id, user.id, user.name);
    setActiveTasks((current) => [...current.filter((item) => item.id !== task.id), task]);
  };

  const handleDecline = async (match) => {
    if (!match.task) return;
    await declineTask(match.task.id);
    setActiveTasks((current) => current.filter((task) => task.id !== match.task.id));
  };

  return (
    <div className={styles.page}>
      <section className={styles.filterBar}>
        <div>
          <p className="section-eyebrow">Core matching workflow</p>
          <h3>Filter recommended tasks by proximity, skill fit, and urgency</h3>
        </div>
        <div className={styles.controls}>
          <label>
            <SlidersHorizontal size={16} />
            Distance
            <input
              type="range"
              min="3"
              max="20"
              value={filters.distance}
              onChange={(event) => setFilters((current) => ({ ...current, distance: Number(event.target.value) }))}
            />
            <span>{filters.distance} km</span>
          </label>
          <label>
            Priority
            <select
              value={filters.priority}
              onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={filters.skillOnly}
              onChange={(event) => setFilters((current) => ({ ...current, skillOnly: event.target.checked }))}
            />
            Require skill overlap
          </label>
        </div>
      </section>

      <section className={styles.queuePanel}>
        <strong>{queue.length}</strong>
        <span>Tasks currently in your queue. Accept or decline to update the simulated backend task system.</span>
      </section>

      <section className={styles.list}>
        {matches.map((match) => (
          <article key={match.issue.id} className={styles.card}>
            <div>
              <p className="section-eyebrow">{match.issue.id}</p>
              <h3>{match.issue.title}</h3>
              <p className={styles.meta}>
                {match.issue.locationName || match.issue.location?.label} • {match.distanceKm} km • Skills:{' '}
                {match.issue.requiredSkills.join(', ')}
              </p>
              <small className={styles.routeHint}>Route optimization: fastest arrival via eastern connector.</small>
            </div>

            <div className={styles.scoreBlock}>
              <strong>{match.matchScore}%</strong>
              <span>Match score</span>
              <small>{match.priority} priority</small>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() =>
                  setSavedTasks((current) =>
                    current.includes(match.issue.id)
                      ? current.filter((id) => id !== match.issue.id)
                      : [...current, match.issue.id],
                  )
                }
              >
                {savedTasks.includes(match.issue.id) ? 'Saved' : 'Save'}
              </button>

              {match.task ? (
                <>
                  {match.task.status === 'queued' ? (
                    <>
                      <button type="button" onClick={() => handleDecline(match)}>
                        Decline
                      </button>

                      <button type="button" className="primaryButton" onClick={() => handleAccept(match)}>
                        Accept
                      </button>
                    </>
                  ) : (
                    <span>{match.isAssignedToMe ? `Assigned to you: ${match.task.status}` : `Assigned: ${match.task.status}`}</span>
                  )}

                  <Link to={`/volunteer/tasks/${match.task.id}`} className="primaryButton">
                    View Task
                  </Link>
                </>
              ) : (
                <Link to={`/volunteer/tasks/${match.issue.id}`} className="primaryButton">
                  View Details
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
