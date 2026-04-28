import { LayoutGrid, Table2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SkeletonBlock from '../../components/common/SkeletonBlock';
import { useNotifications } from '../../context/NotificationContext';
import { buildEmergencyToast } from '../../services/notificationService';
import { updateNgoIssue } from '../../services/ngoService';
import { useAppData } from '../../context/AppDataContext';
import styles from './IssueManagementPage.module.css';

export default function IssueManagementPage() {
  const { allIssues: issues } = useAppData();
  const [view, setView] = useState('table');
  const { pushToast } = useNotifications();

  const loading = !issues;

  const columns = ['Pending Review', 'Open', 'In Progress', 'Resolved'];

  const handleAction = async (issueId, action) => {
    const payloadMap = {
      resolve: { status: 'Resolved', updateLabel: 'Marked resolved by NGO admin' },
      escalate: { escalate: true, updateLabel: 'Escalated by control center' },
      assign: { status: 'In Progress', updateLabel: 'Assignment requested from control center' },
    };
    const updatedIssue = await updateNgoIssue(issueId, payloadMap[action]);
    if (action === 'escalate') pushToast(buildEmergencyToast(updatedIssue.title));
  };

  if (loading) return <SkeletonBlock height={260} />;

  return (
    <div className={styles.page}>
      <div className={styles.switcher}>
        <button type="button" className={view === 'table' ? styles.active : ''} onClick={() => setView('table')}>
          <Table2 size={16} />
          Table
        </button>
        <button type="button" className={view === 'kanban' ? styles.active : ''} onClick={() => setView('kanban')}>
          <LayoutGrid size={16} />
          Kanban
        </button>
      </div>

      {view === 'table' ? (
        <div className={styles.tableCard}>
          <table>
            <thead>
              <tr><th>ID</th><th>Issue</th><th>Priority</th><th>Category</th><th>Status</th><th>Media</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>{issue.title}</td>
                  <td>{issue.priority}</td>
                  <td>{issue.category}</td>
                  <td>{issue.status}</td>
                  <td>
                    {issue.mediaUrls?.length > 0 && (
                      <div className={styles.mediaThumbnails} style={{ display: 'flex', gap: '4px' }}>
                        {issue.mediaUrls.map((url, i) => (
                          url.includes('video') 
                            ? <video key={i} src={url} width="40" height="40" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                            : <img key={i} src={url} width="40" height="40" style={{ objectFit: 'cover', borderRadius: '4px' }} alt="issue media" />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.actionCell}>
                    <button type="button" onClick={() => handleAction(issue.id, 'assign')}>Assign</button>
                    <button type="button" onClick={() => handleAction(issue.id, 'escalate')}>Escalate</button>
                    <button type="button" onClick={() => handleAction(issue.id, 'resolve')}>Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.kanban}>
          {columns.map((column) => (
            <section key={column} className={styles.column}>
              <h3>{column}</h3>
              {issues.filter((issue) => issue.status === column).map((issue) => (
                <article key={issue.id} className={styles.kanbanCard}>
                  <strong>{issue.title}</strong>
                  <p>{issue.locationName || issue.location?.label}</p>
                  <span className={`badge badge${issue.priority}`}>{issue.priority}</span>
                  {issue.mediaUrls?.length > 0 && (
                    <div className={styles.mediaPreview} style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto' }}>
                      {issue.mediaUrls.map((url, i) => (
                        url.includes('video') 
                          ? <video key={i} src={url} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                          : <img key={i} src={url} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '4px' }} alt="issue media" />
                      ))}
                    </div>
                  )}
                  <div className={styles.quickActions}>
                    <button type="button" onClick={() => handleAction(issue.id, 'assign')}>Assign</button>
                    <button type="button" onClick={() => handleAction(issue.id, 'resolve')}>Resolve</button>
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
