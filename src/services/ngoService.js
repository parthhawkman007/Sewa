import apiClient from './apiClient';
import endpoints from './endpoints';

export async function getNgoDashboardMetrics() {
  return apiClient.get(endpoints.ngo.dashboard);
}

export async function getNgoAnalytics() {
  return apiClient.get(endpoints.ngo.analytics);
}

export async function getNgoIssues() {
  return apiClient.get(endpoints.ngo.issues);
}

export async function getNgoVolunteers() {
  return apiClient.get(endpoints.ngo.volunteers);
}

export async function autoAssignBestMatch(issueId, volunteerId, volunteerName, issueTitle) {
  return apiClient.post(endpoints.ngo.autoAssign, { issueId, volunteerId, volunteerName, issueTitle });
}

export async function updateNgoIssue(issueId, payload) {
  return apiClient.post(endpoints.ngo.updateIssue, { issueId, ...payload });
}
