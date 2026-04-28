import { Building2, LockKeyhole, Mail, Sparkles, UserCircle2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthFormPage.module.css';

const roleContent = {
  user: {
    icon: Users,
    title: 'User access',
    subtitle: 'Report community issues, access resource hubs, and monitor live progress.',
  },
  volunteer: {
    icon: Sparkles,
    title: 'Volunteer access',
    subtitle: 'Sign in to manage shifts, accept matched tasks, and respond faster in the field.',
  },
  ngo: {
    icon: Building2,
    title: 'NGO admin access',
    subtitle: 'Enter the operations workspace for triage, volunteer management, and allocation.',
  },
};

export default function AuthFormPage({ mode }) {
  const { user, selectedRole, setSelectedRole, login, signup, continueWithGoogle, authLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const content = useMemo(() => roleContent[selectedRole], [selectedRole]);
  const Icon = content.icon;

  useEffect(() => {
    const presets = {
      user: { name: 'Aarav Sharma', email: 'aarav@civicgrid.org', password: 'demo-user', organization: '' },
      volunteer: { name: 'Maya Patel', email: 'maya@communitylink.org', password: 'demo-volunteer', organization: '' },
      ngo: { name: 'Nina Joseph', email: 'nina@hopeworks.org', password: 'demo-ngo', organization: 'HopeWorks Foundation' },
    };
    setForm(presets[selectedRole]);
  }, [selectedRole, location.pathname]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      role: selectedRole,
      name: form.name,
      email: form.email,
      organization: form.organization,
    };
    if (mode === 'signup') await signup(payload);
    else await login(payload);
    navigate('/');
  };

  const handleGoogle = async () => {
    await continueWithGoogle({ role: selectedRole });
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <motion.section className={styles.layout} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <aside className={styles.sidePanel}>
          <p className="section-eyebrow">Secure role-based access</p>
          <h1>{mode === 'signup' ? 'Create your workspace account.' : 'Welcome back to operations.'}</h1>
          <p>{content.subtitle}</p>
          <div className={styles.roleStack}>
            {Object.entries(roleContent).map(([role, item]) => {
              const RoleIcon = item.icon;
              return (
                <button
                  key={role}
                  type="button"
                  className={`${styles.roleButton} ${selectedRole === role ? styles.active : ''}`}
                  onClick={() => setSelectedRole(role)}
                >
                  <RoleIcon size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.formHead}>
            <Icon size={18} />
            <div>
              <strong>{content.title}</strong>
              <p>{mode === 'signup' ? 'Create credentials and role context.' : 'Use email or continue with Google.'}</p>
            </div>
          </div>

          <button type="button" className={styles.googleButton} onClick={handleGoogle} disabled={authLoading}>
            <span className={styles.googleMark}>G</span>
            {authLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className={styles.divider}><span>or continue with email</span></div>

          <label>
            <span><UserCircle2 size={15} /> Full name</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>

          <label>
            <span><Mail size={15} /> Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
          </label>

          {selectedRole === 'ngo' ? (
            <label>
              <span><Building2 size={15} /> Organization name</span>
              <input value={form.organization} onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))} required />
            </label>
          ) : null}

          <label>
            <span><LockKeyhole size={15} /> Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </label>

          <button type="submit" className="primaryButton" disabled={authLoading}>
            {authLoading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>

          <div className={styles.footerText}>
            {mode === 'signup' ? 'Already have an account?' : 'Need a new account?'}
            <Link to={mode === 'signup' ? '/auth/login' : '/auth/signup'}>
              {mode === 'signup' ? ' Sign in' : ' Sign up'}
            </Link>
          </div>

          <Link to="/welcome" className={styles.backLink}>Back to welcome</Link>
        </form>
      </motion.section>
    </div>
  );
}
