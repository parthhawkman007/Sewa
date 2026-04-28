import axios from 'axios';
import endpoints from './endpoints';

console.log('API Client initializing...');
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = VITE_API_BASE_URL || 'https://sewa-backend-335158139681.asia-south1.run.app/api';
console.log('Target API URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for logging or auth tokens if needed in the future
apiClient.interceptors.request.use((config) => {
  // console.log('Outgoing request to:', config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Minimal local versions for UI hints (optional now that backend handles it)
function categorySuggestion(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('water') || normalized.includes('flood')) return 'Flood Relief';
  if (normalized.includes('medicine') || normalized.includes('medical')) return 'Medical Support';
  if (normalized.includes('power') || normalized.includes('electric')) return 'Infrastructure';
  if (normalized.includes('food') || normalized.includes('shelter')) return 'Relief Supplies';
  return 'Community Support';
}

function derivePriority(urgency, emergency = false) {
  if (emergency || urgency >= 75) return 'High';
  if (urgency >= 45) return 'Medium';
  return 'Low';
}

export { categorySuggestion, derivePriority };
export default apiClient;
