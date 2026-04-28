import apiClient from './apiClient';
import endpoints from './endpoints';

export async function loginUser(payload) {
  return apiClient.post(endpoints.auth.login, payload);
}

export async function signupUser(payload) {
  return apiClient.post(endpoints.auth.signup, payload);
}

export async function continueWithGoogle(payload) {
  return apiClient.post(endpoints.auth.google, payload);
}
