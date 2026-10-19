import apiClient from './api';

/**
 * Fetch paginated, filtered menu items from the public catalog.
 * @param {Object} params - Query parameters
 * @param {string} [params.category] - Filter by category
 * @param {string} [params.search] - Search by name
 * @param {string} [params.sortBy] - Sort field ('price' | 'createdAt')
 * @param {string} [params.order] - Sort direction ('asc' | 'desc')
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 */
export const getMenuItems = async (params = {}) => {
  const response = await apiClient.get('/menu', { params });
  return response.data;
};

/**
 * Fetch a single menu item by ID.
 * @param {string} id - MenuItem ObjectId
 */
export const getMenuItemById = async (id) => {
  const response = await apiClient.get(`/menu/${id}`);
  return response.data;
};

/**
 * Create a new menu item (Admin only).
 * @param {Object} itemData - Menu item fields
 */
export const createMenuItem = async (itemData) => {
  const response = await apiClient.post('/menu', itemData);
  return response.data;
};

/**
 * Update an existing menu item (Admin only).
 * @param {string} id - MenuItem ObjectId
 * @param {Object} updates - Fields to update
 */
export const updateMenuItem = async (id, updates) => {
  const response = await apiClient.patch(`/menu/${id}`, updates);
  return response.data;
};

/**
 * Soft-delete (deactivate) a menu item (Admin only).
 * @param {string} id - MenuItem ObjectId
 */
export const deleteMenuItem = async (id) => {
  const response = await apiClient.delete(`/menu/${id}`);
  return response.data;
};
