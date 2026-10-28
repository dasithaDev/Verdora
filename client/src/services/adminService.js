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
 * Soft-delete / deactivate a menu item from public customer catalog, or permanently delete.
 * @param {string} id - MenuItem ObjectId
 * @param {boolean} [permanent=false] - Whether to permanently remove from database
 * @returns {Promise<Object>}
 */
export const deleteMenuItem = async (id, permanent = false) => {
  const url = permanent ? `/menu/${id}?hard=true` : `/menu/${id}`;
  const response = await apiClient.delete(url);
  return response.data;
};

/**
 * Fetch all cafe tables (including inactive) for admin floor management.
 * @returns {Promise<Object>}
 */
export const getAdminTables = async () => {
  const response = await apiClient.get('/admin/tables');
  return response.data;
};

/**
 * Create a new cafe table.
 * @param {Object} tableData - { tableNumber, capacity, isActive }
 * @returns {Promise<Object>}
 */
export const createAdminTable = async (tableData) => {
  const response = await apiClient.post('/admin/tables', tableData);
  return response.data;
};

/**
 * Update an existing cafe table.
 * @param {string} id - Table ObjectId
 * @param {Object} tableData - { tableNumber, capacity, isActive }
 * @returns {Promise<Object>}
 */
export const updateAdminTable = async (id, tableData) => {
  const response = await apiClient.patch(`/admin/tables/${id}`, tableData);
  return response.data;
};

/**
 * Delete / deactivate a cafe table.
 * @param {string} id - Table ObjectId
 * @returns {Promise<Object>}
 */
export const deleteAdminTable = async (id) => {
  const response = await apiClient.delete(`/admin/tables/${id}`);
  return response.data;
};

/**
 * Fetch all employees and users with optional filtering.
 * @param {Object} [params] - { role, search, page, limit }
 * @returns {Promise<Object>}
 */
export const getAdminUsers = async (params = {}) => {
  const response = await apiClient.get('/admin/users', { params });
  return response.data;
};

/**
 * Create a new employee / staff member.
 * @param {Object} userData - { name, email, password, role, avatar }
 * @returns {Promise<Object>}
 */
export const createAdminUser = async (userData) => {
  const response = await apiClient.post('/admin/users', userData);
  return response.data;
};

/**
 * Remove an employee / user account.
 * @param {string} id - User ObjectId
 * @returns {Promise<Object>}
 */
export const deleteAdminUser = async (id) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

