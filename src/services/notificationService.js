import apiClient from './apiClient';
import endpoints from './endpoints';

export async function getNotifications(role) {
  return apiClient.get(endpoints.notifications.list, { params: { role } });
}

export async function createNotification(payload) {
  return apiClient.post(endpoints.notifications.create, payload);
}

export async function markNotificationRead(id) {
  return apiClient.post(endpoints.notifications.markRead, { id });
}

export const notificationTemplates = [];

export function buildAssignmentToast(issueTitle, volunteerName) {
  return {
    title: 'Volunteer assigned',
    message: `${volunteerName} has been linked to "${issueTitle}".`,
    type: 'success',
  };
}

export function buildIssueToast(title) {
  return {
    title: 'Issue submitted',
    message: `${title} is now in the NGO review queue.`,
    type: 'success',
  };
}

export function buildEmergencyToast(title) {
  return {
    title: 'Emergency alert',
    message: `${title} has been flagged as critical.`,
    type: 'warning',
  };
}
