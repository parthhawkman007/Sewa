import {
  ArrowRight,
  BrainCircuit,
  Building2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import MapPreview from '../../components/common/MapPreview';
import styles from './WelcomePage.module.css';

const statItems = [
  { label: 'Issues Reported', value: 1284, suffix: '+' },
  { label: 'Active Volunteers', value: 342, suffix: '' },
  { label: 'Tasks Completed', value: 917, suffix: '+' },
];

const steps = [
  {
    icon: MapPin,
    title: 'Report Issue',
    description: 'Citizens raise urgent incidents with structured details, live urgency signals, and location context.',
  },
  {
    icon: BrainCircuit,
    title: 'Smart Matching',
    description: 'The platform weighs distance, skills, reliability, and urgency to find the strongest responder fit.',
  },
  {
    icon: HeartHandshake,
    title: 'Help Delivered',
    description: 'Volunteers and NGOs act fast, while everyone tracks dispatch, progress, and impact in one place.',
  },
];

const roleColumns = [
  {
    role: 'user',
    icon: Users,
    title: 'Citizen',
    bullets: ['Report problems', 'Track progress'],
    description: 'Surface community needs fast and follow the response without losing visibility.',
  },
  {
    role: 'volunteer',
    icon: Sparkles,
    title: 'Volunteer',
    bullets: ['Get matched tasks', 'Help nearby'],
    description: 'See the highest-impact assignments first and respond where you can help most.',
  },
  {
    role: 'ngo',
    icon: Building2,
    title: 'NGO',
    bullets: ['Manage operations', 'Allocate resources'],
    description: 'Coordinate teams, compare volunteer fit, and move scarce resources with confidence.',
  },
];

const testimonials = [
  {
    quote: 'We cut allocation time dramatically because the platform surfaced the right volunteers before we even asked.',
    org: 'ReliefBridge NGO',
    badge: 'Operational Partner',
  },
  {
    quote: 'The live issue timeline gave our field coordinators a single source of truth during high-pressure response windows.',
    org: 'HopeWorks Foundation',
    badge: 'NGO Admin Team',
  },
  {
    quote: 'As a volunteer, I stopped wasting time searching for tasks and started accepting the ones I could actually solve.',
    org: 'Community Volunteer Network',
    badge: 'Volunteer Lead',
  },
];

const landingIssues = [
  {
    id: 'IMP-01',
    title: 'Medical pickup delay',
    priority: 'High',
    coordinates: { x: 27, y: 42 },
  },
  {
    id: 'IMP-02',
    title: 'Shelter supply request',
    priority: 'Medium',
    coordinates: { x: 58, y: 28 },
  },
  {
    id: 'IMP-03',
    title: 'Food distribution support',
    priority: 'Low',
    coordinates: { x: 72, y: 62 },
  },
  {
    id: 'IMP-04',
    title: 'Flooded route closure',
    priority: 'High',
    coordinates: { x: 39, y: 70 },
  },
];

function CountUpStat({ value, suffix, label }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.floor(value * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <motion.article
      className={styles.statCard}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35 }}
    >
      <strong>
        {displayValue}
        {suffix}
      </strong>
      <span>{label}</span>
    </motion.article>
  );
}

function RoleCTA({ role, title, description, bullets, icon: Icon, setSelectedRole }) {
  return (
    <motion.article
      className={styles.roleCard}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
    >
      <div className={styles.roleHeader}>
        <div className={styles.roleIcon}>
          <Icon size={18} />
        </div>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <div className={styles.roleBullets}>
        {bullets.map((bullet) => (
          <span key={bullet}>{bullet}</span>
        ))}
      </div>
      <Link
        to="/auth/signup"
        className={styles.inlineLink}
        onClick={() => setSelectedRole(role)}
      >
        Choose {title} <ArrowRight size={15} />
      </Link>
    </motion.article>
  );
}

export default function WelcomePage() {
  const { user, setSelectedRole } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className={styles.eyebrowBadge}>
            <ShieldCheck size={15} />
            Real-time coordination intelligence
          </div>
          <h1>Connecting Help to Where It&apos;s Needed Most</h1>
          <p>
            AI-powered platform that matches volunteers with real-world problems instantly.
          </p>

          <div className={styles.heroActions}>
            <Link
              to="/auth/signup"
              className="primaryButton"
              onClick={() => setSelectedRole('user')}
            >
              Report Issue
            </Link>
            <Link
              to="/auth/signup"
              className={styles.secondaryButton}
              onClick={() => setSelectedRole('volunteer')}
            >
              Join as Volunteer
            </Link>
            <Link
              to="/auth/signup"
              className={styles.secondaryButton}
              onClick={() => setSelectedRole('ngo')}
            >
              Register NGO
            </Link>
          </div>

          <div className={styles.heroSignalRow}>
            <div className={styles.signalCard}>
              <span>Dispatch precision</span>
              <strong>92%</strong>
            </div>
            <div className={styles.signalCard}>
              <span>Average match time</span>
              <strong>18 sec</strong>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.heroPanel}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className={styles.orbitBackground} />
          <div className={styles.panelTop}>
            <p className="section-eyebrow">Live impact console</p>
            <h2>Field demand is changing by the minute.</h2>
            <p>
              Smart Resource Allocation gives citizens, volunteers, and NGOs one shared view of urgency, capacity, and dispatch.
            </p>
          </div>

          <div className={styles.previewStack}>
            <article className={styles.previewCard}>
              <span className={styles.previewTag}>High urgency</span>
              <strong>Flooded underpass blocking school buses</strong>
              <p>3 volunteers ranked and NGO alerted for route rerouting.</p>
            </article>
            <article className={styles.previewCard}>
              <span className={styles.previewTagTeal}>AI matched</span>
              <strong>Medical pickup assigned in 16 seconds</strong>
              <p>Best-fit responder selected using distance, skills, and availability.</p>
            </article>
          </div>
        </motion.div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="section-eyebrow">Live impact stats</p>
          <h2>Operational activity across the response network</h2>
        </div>
        <div className={styles.statsGrid}>
          {statItems.map((stat) => (
            <CountUpStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="section-eyebrow">How it works</p>
          <h2>Three steps from report to delivery</h2>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                className={styles.stepCard}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35 }}
              >
                <div className={styles.stepIcon}>
                  <Icon size={20} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="section-eyebrow">Role-based features</p>
          <h2>Each workspace is built for a different kind of impact</h2>
        </div>
        <div className={styles.roleGrid}>
          {roleColumns.map((column) => (
            <RoleCTA key={column.role} {...column} setSelectedRole={setSelectedRole} />
          ))}
        </div>
      </section>

      

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="section-eyebrow">Trust and proof</p>
          <h2>Teams use the platform when speed and coordination matter</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {testimonials.map((item) => (
            <motion.article
              key={item.org}
              className={styles.testimonialCard}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35 }}
            >
              <div className={styles.logoPill}>{item.org.slice(0, 2).toUpperCase()}</div>
              <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
              <strong>{item.org}</strong>
              <span>{item.badge}</span>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className="section-eyebrow">Final call to action</p>
          <h2>Start Making Impact Today</h2>
          <p>
            Choose your role, enter the platform, and turn live community needs into coordinated action.
          </p>
        </div>
        <Link to="/auth/signup" className="primaryButton">
          Get Started
        </Link>
      </section>
    </div>
  );
}
