import { AlertTriangle, Camera, CheckCircle2, MapPinned, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

import { buildIssuePayload, createIssue, getPriorityBand, suggestCategory } from '../../services/issueService';
import { buildEmergencyToast, buildIssueToast } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import styles from './ReportIssuePage.module.css';

const steps = ['Issue details', 'Location & media', 'Review & submit'];

export default function ReportIssuePage() {
  const auth = useAuth();
  const user = auth?.user;
  const { pushToast } = useNotifications();

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedIssue, setSubmittedIssue] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: 60,
    category: 'Community Support',
    emergency: false,
    location: { label: '' }, // ✅ removed lat/lng
    mediaUrls: [],
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      category: suggestCategory(`${current.title} ${current.description}`),
    }));
  }, [form.title, form.description]);

  const priorityBand = useMemo(
    () => getPriorityBand(form.urgency, form.emergency),
    [form.urgency, form.emergency],
  );

  // ✅ REAL FILE UPLOAD
  const handleFileUpload = async (file) => {
    if (!file) return;

    const fileRef = ref(storage, `issues/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    setForm((current) => ({
      ...current,
      mediaUrls: [...current.mediaUrls, url],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const issue = await createIssue(buildIssuePayload(form, user));
      setSubmittedIssue(issue);

      pushToast(form.emergency ? buildEmergencyToast(issue.title) : buildIssueToast(issue.title));

      setForm({
        title: '',
        description: '',
        urgency: 60,
        category: 'Community Support',
        emergency: false,
        location: { label: '' },
        mediaUrls: [],
      });

      setStepIndex(0);
    } catch {
      setError('Unable to submit the issue right now. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-2">
      <motion.form className={styles.formCard} onSubmit={handleSubmit}>
        
        <div>
          <p className="section-eyebrow">User intake workflow</p>
          <h3>Report a new operational issue</h3>
        </div>

        {/* STEPPER */}
        <div className={styles.stepper}>
          {steps.map((step, index) => (
            <button key={step} type="button" onClick={() => setStepIndex(index)}>
              {index + 1} {step}
            </button>
          ))}
        </div>

        {/* STEP 1 */}
        {stepIndex === 0 && (
          <div className={styles.stack}>
            <input placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />

            <textarea placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <input type="range" min="0" max="100"
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })} />

            <label>
              <input type="checkbox"
                checked={form.emergency}
                onChange={(e) => setForm({ ...form, emergency: e.target.checked })} />
              Emergency
            </label>
          </div>
        )}

        {/* STEP 2 */}
        {stepIndex === 1 && (
          <div className={styles.stack}>
            <input
              placeholder="Describe location (e.g. near school)"
              value={form.location.label}
              onChange={(e) =>
                setForm({ ...form, location: { label: e.target.value } })
              }
            />

            {/* ✅ REAL MEDIA BUTTONS */}
            <div>
              <input type="file" accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])} />

              <input type="file" accept="video/*"
                onChange={(e) => handleFileUpload(e.target.files[0])} />
            </div>

            {/* PREVIEW */}
            <div>
              {form.mediaUrls.map((url) => (
                <div key={url}>
                  {url.includes("video")
                    ? <video src={url} controls width="150" />
                    : <img src={url} width="150" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {stepIndex === 2 && (
          <div>
            <p>{form.category}</p>
            <p>{priorityBand}</p>
            <p>{form.mediaUrls.length} files</p>
          </div>
        )}

        <button type="submit">Submit</button>
      </motion.form>

      <section className={styles.previewCard}>
        <h3>Preview</h3>
        <p>{form.location.label}</p>
      </section>
    </div>
  );
}