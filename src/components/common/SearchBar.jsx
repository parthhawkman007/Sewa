import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SearchBar.module.css';

const searchIndex = [
  { label: 'User Dashboard', to: '/user/dashboard', tags: 'overview issues map' },
  { label: 'Report Issue', to: '/user/report', tags: 'submit urgency category' },
  { label: 'Resource Hub', to: '/user/resources', tags: 'shelter supplies emergency contacts' },
  { label: 'Volunteer Dashboard', to: '/volunteer/dashboard', tags: 'stats tasks' },
  { label: 'Smart Matching', to: '/volunteer/matching', tags: 'filter distance skill urgency' },
  { label: 'Availability', to: '/volunteer/availability', tags: 'shifts status hours' },
  { label: 'NGO Dashboard', to: '/ngo/dashboard', tags: 'metrics heatmap analytics' },
  { label: 'Issue Management', to: '/ngo/issues', tags: 'table kanban' },
  { label: 'Smart Allocation', to: '/ngo/allocation', tags: 'top volunteers assign' },
  { label: 'Volunteer Network', to: '/ngo/network', tags: 'team reliability network' },
];

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase();
    return searchIndex.filter(
      (item) => item.label.toLowerCase().includes(normalized) || item.tags.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <div className={styles.wrapper}>
      <Search size={16} className={styles.icon} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dashboards, workflows, or tools" />
      {!!results.length && (
        <div className={styles.results}>
          {results.map((result) => (
            <Link key={result.to} to={result.to} onClick={() => setQuery('')}>
              {result.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
