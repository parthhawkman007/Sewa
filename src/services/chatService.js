import apiClient from './apiClient';
import endpoints from './endpoints';

export async function getChatThreads(role) {
  return apiClient.get(endpoints.chat.threads, { params: { role } });
}

export async function getChatMessages(threadId) {
  return apiClient.get(endpoints.chat.messages(threadId));
}

export async function sendChatMessage(payload) {
  return apiClient.post(endpoints.chat.send, payload);
}
