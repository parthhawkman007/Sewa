import { CalendarClock, CheckCircle2, Clock3, ToggleLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVolunteerShiftTemplates, updateVolunteerAvailability } from '../../services/volunteerService';
import styles from './VolunteerAvailabilityPage.module.css';

export default function VolunteerAvailabilityPage() {
  const auth = useAuth();
const user = auth?.user;
  const [available, setAvailable] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    getVolunteerShiftTemplates().then((data) => {
      setShifts(data);
      if (data?.length > 0) setSelectedShift(data[0].id);
    });
  }, []);

  // Compute weekly hours from shift durations (parse "HH:MM - HH:MM" strings)
  const weeklyHours = useMemo(() => {
    let total = 0;
    shifts.forEach((shift) => {
      if (shift.time) {
        const parts = shift.time.split(' - ');
        if (parts.length === 2) {
          const [sh, sm] = parts[0].split(':').map(Number);
          const [eh, em] = parts[1].split(':').map(Number);
          total += (eh * 60 + em - sh * 60 - sm) / 60;
        }
      }
    });
    return total > 0 ? `${total} hrs` : 'N/A';
  }, [shifts]);

  const reliability = user?.reliability ? `${user.reliability}%` : 'N/A';

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <p className="section-eyebrow">Volunteer readiness</p>
          <h3>Manage live availability and preferred shift windows</h3>
          <p className={styles.helper}>Manage your availability and preferred shift windows for the volunteer readiness planner.</p>
        </div>
        <button
          type="button"
          className={styles.statusButton}
          onClick={async () => {
            const next = !available;
            setAvailable(next);
            await updateVolunteerAvailability(user.id, next ? 'Online' : 'Offline');
          }}
        >
          <ToggleLeft size={18} />
          {available ? 'Online now' : 'Offline'}
        </button>
      </section>

      <section className="grid grid-4">
        <article className={styles.statCard}><CheckCircle2 size={18} /><strong>{available ? 'Live' : 'Paused'}</strong><span>Dispatch status</span></article>
        <article className={styles.statCard}><CalendarClock size={18} /><strong>{shifts.length}</strong><span>Suggested shifts</span></article>
        <article className={styles.statCard}><Clock3 size={18} /><strong>{weeklyHours}</strong><span>Weekly target</span></article>
        <article className={styles.statCard}><CheckCircle2 size={18} /><strong>{reliability}</strong><span>Attendance reliability</span></article>
      </section>

      <section className={styles.shiftGrid}>
        {shifts.map((shift) => (
          <button
            key={shift.id}
            type="button"
            className={`${styles.shiftCard} ${selectedShift === shift.id ? styles.active : ''}`}
            onClick={() => setSelectedShift(shift.id)}
          >
            <strong>{shift.label}</strong>
            <span>{shift.time}</span>
            <p>{shift.zone}</p>
            <small>{shift.load}</small>
          </button>
        ))}
      </section>
    </div>
  );
}
