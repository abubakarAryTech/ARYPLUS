// User service - API-based user management
import api from './api';

export const getUserPlan = async (uid) => {
  const response = await api.get(`/api/v2/member/${uid}/plan`);
  return response.data;
};

export const deleteUserAccount = async (uid) => {
  const response = await api.delete(`/api/user/${uid}`);
  return response.data;
};

export const getUserSessions = async (uid) => {
  const response = await api.get(`/api/user/${uid}/sessions`);
  return response.data;
};

export const removeUserSession = async (sessionId) => {
  const response = await api.delete(`/api/sessions/${sessionId}`);
  return response.data;
};

export const getAccountDetails = async (uid) => {
  const response = await api.get(`/api/user/${uid}/details`);
  return response.data;
};

export const updateUserData = async (uid, data) => {
  const response = await api.put(`/api/user/${uid}`, data);
  return response.data;
};