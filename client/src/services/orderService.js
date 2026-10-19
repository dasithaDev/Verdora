import apiClient from './api';

/**
 * Place a new cafe order from the customer's cart.
 * @param {Object} orderData
 * @param {Array<{ menuItemId: string, quantity: number }>} orderData.items
 * @param {string} [orderData.notes]
 * @returns {Promise<Object>} API response envelope containing created Order
 */
export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};

/**
 * Retrieve the authenticated customer's order history.
 * @param {Object} [params] - Query parameters (page, limit)
 * @returns {Promise<Object>} API response envelope with orders and pagination
 */
export const getMyOrders = async (params = {}) => {
  const response = await apiClient.get('/orders/my', { params });
  return response.data;
};

/**
 * Retrieve a single order by ID (customer owner or admin).
 * @param {string} id - Order ObjectId
 * @returns {Promise<Object>} API response envelope with order details
 */
export const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

/**
 * Cancel an eligible order (customer owner only while in 'placed' status).
 * @param {string} id - Order ObjectId
 * @returns {Promise<Object>} API response envelope with cancelled order
 */
export const cancelOrder = async (id) => {
  const response = await apiClient.patch(`/orders/${id}/cancel`);
  return response.data;
};

/**
 * Retrieve all cafe orders across all customers (Admin / Staff only).
 * @param {Object} [params] - Query filters (status, page, limit)
 * @returns {Promise<Object>} API response envelope with all orders
 */
export const getAllOrdersAdmin = async (params = {}) => {
  const response = await apiClient.get('/admin/orders', { params });
  return response.data;
};

/**
 * Update an order's status enforcing the State Transition Matrix (Admin / Staff only).
 * @param {string} id - Order ObjectId
 * @param {string} status - New order status ('preparing' | 'ready' | 'completed' | 'cancelled')
 * @returns {Promise<Object>} API response envelope with updated order
 */
export const updateOrderStatusAdmin = async (id, status) => {
  const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};
