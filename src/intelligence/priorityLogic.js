export function derivePriority(urgency) {
  if (urgency >= 75) return 'High';
  if (urgency >= 45) return 'Medium';
  return 'Low';
}
