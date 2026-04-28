import apiClient, { categorySuggestion, derivePriority } from './apiClient';
import endpoints from './endpoints';

export async function getIssues() {
  return apiClient.get(endpoints.issues.list);
}

export async function getIssueById(id) {
  return apiClient.get(endpoints.issues.detail(id));
}

export async function getIssueTimeline(id) {
  return apiClient.get(endpoints.issues.timeline(id));
}

export async function getUserIssues(reportedBy) {
  return apiClient.get(endpoints.issues.history, { params: { reportedBy } });
}

export async function getCitizenIssues(reportedBy) {
  return getUserIssues(reportedBy);
}

export async function getNearbyIssues() {
  return apiClient.get(endpoints.issues.nearby);
}

export async function getIssueHistory(reportedBy) {
  return getUserIssues(reportedBy);
}

export async function getUserResourceRecommendations(category = 'General') {
  return apiClient.get(endpoints.resources.recommendations, { params: { category } });
}

export async function createIssue(payload) {
  return apiClient.post(endpoints.issues.create, payload);
}

export async function pollIssueUpdates(issueId) {
  const [issue, timeline] = await Promise.all([getIssueById(issueId), getIssueTimeline(issueId)]);
  return { issue, timeline };
}

export function suggestCategory(text) {
  return categorySuggestion(text);
}

export function buildIssuePayload(form, user) {
  return {
    title: form.title,
    description: form.description,
    category: form.category || suggestCategory(`${form.title} ${form.description}`),
    urgency: Number(form.urgency),
    emergency: Boolean(form.emergency),
    location: form.location,
    mediaUrls: form.mediaUrls || [],
    reportedBy: user.name,
    requiredSkills:
      (form.category || '').includes('Medical')
        ? ['Medical Support', 'Driving']
        : ['Field Ops', 'Logistics'],
  };
}

export function getPriorityBand(urgency, emergency = false) {
  return derivePriority(Number(urgency), emergency);
}

export async function getResourceAlerts() {
  return apiClient.get(endpoints.resources.alerts);
}