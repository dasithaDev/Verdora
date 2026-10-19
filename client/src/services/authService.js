import apiClient from './api';

/**
 * Register a new customer account.
 * @param {Object} data - { name, email, password }
 * @returns {Promise<Object>} API response envelope with created user
 */
export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Log in with email and password. Sets httpOnly cookie.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} API response envelope with user profile
 */
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * Log out current session and clear auth cookies.
 * @returns {Promise<Object>} API response envelope
 */
export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

/**
 * Fetch current authenticated user's profile.
 * @returns {Promise<Object>} API response envelope with safe user data
 */
export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};
