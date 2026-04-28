import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === 'dark' ? SunMedium : MoonStar;

  return (
    <button type="button" onClick={toggleTheme} className={styles.toggle}>
      <Icon size={16} />
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
