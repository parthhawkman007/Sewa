import { ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthLanding.module.css';

const roleDetails = {
  citizen: {
    icon: Users,
    title: 'Citizen reporting',
    description: 'Submit urgent community needs and track response progress with live priority signals.',
  },
  volunteer: {
    icon: Sparkles,
    title: 'Volunteer response',
    description: 'Accept best-fit tasks through score-driven matching and proximity-aware routing.',
  },
  ngo: {
    icon: ShieldCheck,
    title: 'NGO orchestration',
    description: 'Coordinate issue triage, heatmaps, and assignments from a single operational console.',
  },
};

export default function AuthLanding() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const { selectedRole, setSelectedRole, login, signup } = useAuth();
  const navigate = useNavigate();
  const activeRole = roleDetails[selectedRole];
  const ActiveRoleIcon = activeRole.icon;

  useEffect(() => {
    const presets = {
      citizen: { name: 'Aarav Sharma', email: 'aarav@civicgrid.org' },
      volunteer: { name: 'Maya Patel', email: 'maya@communitylink.org' },
      ngo: { name: 'Nina Joseph', email: 'nina@hopeworks.org' },
    };
    setForm(presets[selectedRole]);
  }, [selectedRole]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, role: selectedRole };
    if (isSignup) signup(payload);
    else login(payload);
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <motion.section className={styles.hero} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.copy}>
          <p className="section-eyebrow">Volunteer coordination SaaS</p>
          <h1>Allocate the right response capacity before the bottleneck appears.</h1>
          <p>
            Smart Resource Allocation connects citizens, volunteers, and NGOs with a shared
            decision layer driven by urgency, skills, and field distance.
          </p>
        </div>

        <div className={styles.panel}>
          <div className={styles.rolePicker}>
            {Object.entries(roleDetails).map(([role, detail]) => {
              const Icon = detail.icon;
              return (
                <button key={role} type="button" className={`${styles.roleButton} ${selectedRole === role ? styles.active : ''}`} onClick={() => setSelectedRole(role)}>
                  <Icon size={18} />
                  <div>
                    <strong>{detail.title}</strong>
                    <span>{detail.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <ActiveRoleIcon size={18} />
              <div>
                <strong>{activeRole.title}</strong>
                <p>{activeRole.description}</p>
              </div>
            </div>
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter full name" required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.org" required />
            </label>
            <button type="submit" className="primaryButton">
              {isSignup ? 'Create account' : 'Login'}
            </button>
            <button type="button" onClick={() => setIsSignup((current) => !current)}>
              {isSignup ? 'Already registered? Login' : 'Need access? Sign up'}
            </button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}
