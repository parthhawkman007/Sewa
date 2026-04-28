import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import styles from './DonutChart.module.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function StatusDonut({ data }) {
  return (
    <div className={styles.card}>
      <h3>Issue status mix</h3>
      <Doughnut
        data={{
          labels: data.labels,
          datasets: [{ data: data.values, backgroundColor: ['#4F46E5', '#14B8A6', '#F59E0B'], borderWidth: 0 }],
        }}
        options={{ plugins: { legend: { position: 'bottom' } } }}
      />
    </div>
  );
}

export function TrendLine({ labels, values, title }) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <Line
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: '#14B8A6',
              backgroundColor: 'rgba(20, 184, 166, 0.18)',
              tension: 0.35,
              fill: true,
            },
          ],
        }}
        options={{ plugins: { legend: { display: false } } }}
      />
    </div>
  );
}
