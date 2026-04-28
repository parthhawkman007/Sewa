import { Activity, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getVolunteerNetwork } from '../../services/volunteerService';
import styles from './NgoNetworkPage.module.css';

export default function NgoNetworkPage() {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    getVolunteerNetwork().then(setVolunteers);
  }, []);

  const avgReliability = useMemo(() => {
    if (!volunteers.length) return 'N/A';
    const avg = volunteers.reduce((sum, v) => sum + (Number(v.reliability) || 0), 0) / volunteers.length;
    return `${Math.round(avg)}%`;
  }, [volunteers]);

  const avgRating = useMemo(() => {
    const rated = volunteers.filter((v) => v.rating);
    if (!rated.length) return 'N/A';
    const avg = rated.reduce((sum, v) => sum + Number(v.rating), 0) / rated.length;
    return avg.toFixed(1);
  }, [volunteers]);

  const availableCount = useMemo(
    () => volunteers.filter((v) => v.availability === 'Online' || v.availability === 'Available').length,
    [volunteers],
  );

  return (
    <div className={styles.page}>
      <section className="grid grid-4">
        <article className={styles.statCard}><UsersRound size={18} /><strong>{volunteers.length}</strong><span>Total volunteers</span></article>
        <article className={styles.statCard}><Activity size={18} /><strong>{availableCount}</strong><span>Available now</span></article>
        <article className={styles.statCard}><ShieldCheck size={18} /><strong>{avgReliability}</strong><span>Average reliability</span></article>
        <article className={styles.statCard}><Activity size={18} /><strong>{avgRating}</strong><span>Response quality score</span></article>
      </section>

      <section className={styles.tableCard}>
        <p className="section-eyebrow">Volunteer network</p>
        <h3>Readiness, skill coverage, and current field state</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Skills</th>
              <th>Availability</th>
              <th>Reliability</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((volunteer) => (
              <tr key={volunteer.id}>
                <td>{volunteer.name}</td>
                <td>{volunteer.skills.join(', ')}</td>
                <td>{volunteer.availability}</td>
                <td>{volunteer.reliability}%</td>
                <td>{volunteer.tasksCompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
