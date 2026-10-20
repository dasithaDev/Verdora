import apiClient from './api';

/**
 * Fetch live performance summary and aggregated statistics for the admin dashboard.
 * @returns {Promise<Object>} API response envelope containing stats
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

/**
 * Fetch all cafe orders with optional status/date filters and pagination.
 * @param {Object} [params] - { status, page, limit }
 * @returns {Promise<Object>}
 */
export const getAdminOrders = async (params = {}) => {
  const response = await apiClient.get('/admin/orders', { params });
  return response.data;
};

/**
 * Transition an order's status following the State Transition Matrix.
 * @param {string} id - Order ObjectId
 * @param {string} status - 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
 * @returns {Promise<Object>}
 */
export const updateOrderStatus = async (id, status) => {
  const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

/**
 * Fetch all table reservations with optional status/date filters and pagination.
 * @param {Object} [params] - { status, date, page, limit }
 * @returns {Promise<Object>}
 */
export const getAdminReservations = async (params = {}) => {
  const response = await apiClient.get('/admin/reservations', { params });
  return response.data;
};

/**
 * Transition a reservation's status.
 * @param {string} id - Reservation ObjectId
 * @param {string} status - 'confirmed' | 'completed' | 'cancelled' | 'rejected'
 * @returns {Promise<Object>}
 */
export const updateReservationStatus = async (id, status) => {
  const response = await apiClient.patch(`/admin/reservations/${id}/status`, { status });
  return response.data;
};

/**
 * Create a new healthy dish / beverage item in the menu catalog.
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
export const createMenuItem = async (itemData) => {
  const response = await apiClient.post('/menu', itemData);
  return response.data;
};

/**
 * Update an existing menu item.
 * @param {string} id - MenuItem ObjectId
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
export const updateMenuItem = async (id, itemData) => {
  const response = await apiClient.patch(`/menu/${id}`, itemData);
  return response.data;
};

/**
 * Soft-delete / deactivate a menu item from public customer catalog.
 * @param {string} id - MenuItem ObjectId
 * @returns {Promise<Object>}
 */
export const deleteMenuItem = async (id) => {
  const response = await apiClient.delete(`/menu/${id}`);
  return response.data;
};

/**
 * Fetch all cafe tables.
 * @returns {Promise<Object>}
 */
export const getAdminTables = async () => {
  const response = await apiClient.get('/tables');
  return response.data;
};
