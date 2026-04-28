import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { rankVolunteersForIssue } from '../../intelligence/matchingEngine';
import { autoAssignBestMatch, getNgoVolunteers } from '../../services/ngoService';
import { buildAssignmentToast } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { useAppData } from '../../context/AppDataContext';
import styles from './SmartAllocationPage.module.css';

export default function SmartAllocationPage() {
  const { allIssues: issues } = useAppData();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [assignedMap, setAssignedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { pushToast } = useNotifications();

  useEffect(() => {
    getNgoVolunteers().then((volunteerData) => {
      setVolunteers(volunteerData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (issues?.length > 0 && !selectedIssueId) {
      setSelectedIssueId(issues[0].id);
    }
  }, [issues, selectedIssueId]);

  if (loading) return <SkeletonBlock height={260} />;

  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) || issues[0];
  const selectedRanking = selectedIssue ? rankVolunteersForIssue(selectedIssue, volunteers) : [];

  const handleAssign = async (issue, volunteerName, volunteerId) => {
    await autoAssignBestMatch(issue.id, volunteerId, volunteerName, issue.title);
    setAssignedMap((current) => ({ ...current, [issue.id]: volunteerName }));
    pushToast(buildAssignmentToast(issue.title, volunteerName));
  };

  const handleAutoAssign = async (issue) => {
    const bestMatch = rankVolunteersForIssue(issue, volunteers)[0];
    if (!bestMatch) return;
    await handleAssign(issue, bestMatch.volunteer.name, bestMatch.volunteer.id);
  };

  return (
    <div className={styles.page}>
      {selectedIssue ? (
        <section className={styles.comparisonCard}>
          <div>
            <p className="section-eyebrow">Smart allocation engine</p>
            <h3>{selectedIssue.title}</h3>
            <p className={styles.helperText}>Top 3 volunteers ranked by weighted match, reliability, urgency, and field distance.</p>
            {selectedIssue.mediaUrls?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
                {selectedIssue.mediaUrls.map((url, i) => (
                  url.includes('video') 
                    ? <video key={i} src={url} controls width="120" style={{ borderRadius: '4px' }} />
                    : <img key={i} src={url} width="120" height="80" style={{ borderRadius: '4px', objectFit: 'cover' }} alt="issue media" />
                ))}
              </div>
            )}
          </div>
          <button type="button" className="primaryButton" onClick={() => handleAutoAssign(selectedIssue)}>
            Auto Assign Best Match
          </button>
          <div className={styles.compareList}>
            {selectedRanking.map((entry) => (
              <article key={entry.volunteer.id} className={styles.compareRow}>
                <div className={styles.compareHeader}>
                  <strong>{entry.volunteer.name}</strong>
                  <span>{entry.matchScore}%</span>
                </div>
                <div className={styles.compareBarTrack}>
                  <div className={styles.compareBarFill} style={{ width: `${entry.matchScore}%` }} />
                </div>
                <small>{entry.skillScore}% skill fit • {entry.distanceKm} km away</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {issues.slice(0, 4).map((issue) => {
        const ranked = rankVolunteersForIssue(issue, volunteers);
        return (
          <motion.article
            key={issue.id}
            className={`${styles.card} ${selectedIssueId === issue.id ? styles.selected : ''}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setSelectedIssueId(issue.id)}
          >
            <div className={styles.issueHeader}>
              <div>
                <p className="section-eyebrow">{issue.id}</p>
                <h3>{issue.title}</h3>
                <p>{issue.category}</p>
              </div>
              <span className={`badge badge${issue.priority}`}>{issue.priority}</span>
            </div>

            <div className={styles.rankingList}>
              {ranked.map((entry, index) => (
                <div key={entry.volunteer.id} className={styles.rankRow}>
                  <div>
                    <strong>#{index + 1} {entry.volunteer.name}</strong>
                    <p>{entry.volunteer.skills.join(', ')}</p>
                  </div>
                  <div className={styles.metrics}>
                    <span>{entry.matchScore}% match</span>
                    <span>{entry.distanceKm} km</span>
                    <span>{entry.skillScore}% skills</span>
                    <button type="button" className="primaryButton" onClick={() => handleAssign(issue, entry.volunteer.name, entry.volunteer.id)}>
                      {assignedMap[issue.id] === entry.volunteer.name ? 'Assigned' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {assignedMap[issue.id] ? <div className={styles.assignmentState}>Assigned to {assignedMap[issue.id]}</div> : null}
          </motion.article>
        );
      })}
    </div>
  );
}
