import apiClient from './apiClient';
import endpoints from './endpoints';

export async function getVolunteers() {
  return apiClient.get(endpoints.volunteers.list);
}

export async function getVolunteerNetwork() {
  return getVolunteers();
}

export async function getVolunteerCapacitySnapshot() {
  const volunteers = await getVolunteers();
  return {
    availableNow: volunteers.filter((volunteer) => volunteer.availability === 'Online').length,
    inField: volunteers.filter((volunteer) => volunteer.availability === 'Busy').length,
    avgReliability: Math.round(
      volunteers.reduce((sum, volunteer) => sum + volunteer.reliability, 0) / volunteers.length,
    ),
  };
}

export async function getVolunteerShiftTemplates() {
  return apiClient.get(endpoints.volunteers.shifts);
}

export async function getVolunteerTasks() {
  return apiClient.get(endpoints.volunteers.tasks);
}

export async function getVolunteerQueue() {
  return apiClient.get(endpoints.volunteers.queue);
}

export async function getVolunteerPerformance() {
  return apiClient.get(endpoints.volunteers.performance);
}

export async function updateVolunteerAvailability(volunteerId, status) {
  return apiClient.post(endpoints.volunteers.availability, { volunteerId, status });
}

export async function acceptTask(taskId, volunteerId, volunteerName) {
  return apiClient.post(endpoints.volunteers.acceptTask, { taskId, volunteerId, volunteerName });
}

export async function declineTask(taskId) {
  return apiClient.post(endpoints.volunteers.declineTask, { taskId });
}

export async function completeTask(taskId, issueId, volunteerName) {
  return apiClient.post(endpoints.volunteers.completeTask, { taskId, issueId, volunteerName });
}

export function buildTaskObject(issueId, volunteerId, status) {
  return {
    issueId,
    volunteerId,
    status,
    startTime: null,
    completionTime: null,
  };
}
