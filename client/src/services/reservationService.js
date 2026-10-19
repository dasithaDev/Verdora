import apiClient from './api';

/**
 * Create a new table reservation.
 * @param {Object} reservationData
 * @param {string} reservationData.reservationDate - 'YYYY-MM-DD'
 * @param {string} reservationData.startTime - 'HH:mm'
 * @param {string} [reservationData.endTime] - 'HH:mm'
 * @param {number} reservationData.guestCount - 1 to 20
 * @param {string} [reservationData.tableId] - Optional specific table
 * @param {string} [reservationData.specialRequest] - Optional notes
 * @returns {Promise<Object>} API response envelope containing created Reservation
 */
export const createReservation = async (reservationData) => {
  const response = await apiClient.post('/reservations', reservationData);
  return response.data;
};

/**
 * Retrieve authenticated customer's reservation history.
 * @returns {Promise<Object>} API response envelope with reservations
 */
export const getMyReservations = async () => {
  const response = await apiClient.get('/reservations/my');
  return response.data;
};

/**
 * Retrieve a single reservation by ID (owner or admin).
 * @param {string} id - Reservation ObjectId
 * @returns {Promise<Object>} API response envelope with reservation
 */
export const getReservationById = async (id) => {
  const response = await apiClient.get(`/reservations/${id}`);
  return response.data;
};

/**
 * Edit an existing reservation.
 * @param {string} id - Reservation ObjectId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateReservation = async (id, updateData) => {
  const response = await apiClient.patch(`/reservations/${id}`, updateData);
  return response.data;
};

/**
 * Cancel an eligible reservation and release the table slot.
 * @param {string} id - Reservation ObjectId
 * @returns {Promise<Object>}
 */
export const cancelReservation = async (id) => {
  const response = await apiClient.patch(`/reservations/${id}/cancel`);
  return response.data;
};

/**
 * List all active cafe tables.
 * @returns {Promise<Object>}
 */
export const getTables = async () => {
  const response = await apiClient.get('/tables');
  return response.data;
};

/**
 * Check table availability for a target slot.
 * @param {Object} params - { date, startTime, [endTime], guestCount }
 * @returns {Promise<Object>}
 */
export const checkAvailability = async (params) => {
  const response = await apiClient.get('/tables/availability', { params });
  return response.data;
};

/**
 * Admin: Retrieve all cafe reservations with optional filtering.
 * @param {Object} [params] - { status, date, page, limit }
 * @returns {Promise<Object>}
 */
export const getAllReservationsAdmin = async (params = {}) => {
  const response = await apiClient.get('/admin/reservations', { params });
  return response.data;
};

/**
 * Admin: Update reservation status.
 * @param {string} id - Reservation ObjectId
 * @param {string} status - 'confirmed' | 'completed' | 'cancelled' | 'rejected'
 * @returns {Promise<Object>}
 */
export const updateReservationStatusAdmin = async (id, status) => {
  const response = await apiClient.patch(`/admin/reservations/${id}/status`, { status });
  return response.data;
};
