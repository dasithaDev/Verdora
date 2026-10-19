import mongoose from 'mongoose';

/**
 * Valid allowed order statuses in Verdora Cafe.
 */
export const ALLOWED_STATUSES = ['placed', 'preparing', 'ready', 'completed', 'cancelled'];

/**
 * Strict state transition matrix to prevent invalid business logic state hops.
 * e.g., A completed order cannot return to preparing, and cancelled orders cannot be revived.
 */
export const STATUS_TRANSITIONS = {
  placed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

/**
 * Validates whether transitioning from currentStatus to newStatus is permitted.
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export const canTransitionStatus = (currentStatus, newStatus) => {
  const allowedNext = STATUS_TRANSITIONS[currentStatus] || [];
  return allowedNext.includes(newStatus);
};

/**
 * Validates and sanitizes the order creation payload.
 * Enforces:
 * - Items array exists and has at least 1 item
 * - Each item has a valid MongoDB ObjectId for menuItemId
 * - Quantity is a positive integer between 1 and 99
 * - Notes is an optional string capped at 300 characters
 *
 * @param {object} body
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }>, sanitizedItems: Array }}
 */
export const validateCreateOrderPayload = (body = {}) => {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
      sanitizedItems: [],
      notes: '',
    };
  }

  const { items, notes } = body;

  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: 'items', message: 'Order must contain at least one item' });
    return { isValid: false, errors, sanitizedItems: [], notes: '' };
  }

  const sanitizedItems = [];

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({ field: `items[${index}]`, message: `Item at index ${index} must be an object` });
      return;
    }

    const { menuItemId, quantity } = item;

    if (!menuItemId || !mongoose.Types.ObjectId.isValid(menuItemId)) {
      errors.push({
        field: `items[${index}].menuItemId`,
        message: `Valid 24-character hexadecimal menuItemId is required at index ${index}`,
      });
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 99) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Quantity for item at index ${index} must be an integer between 1 and 99`,
      });
    }

    sanitizedItems.push({
      menuItemId: String(menuItemId).trim(),
      quantity: parsedQty,
    });
  });

  // Validate optional notes
  let sanitizedNotes = '';
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      errors.push({ field: 'notes', message: 'Order notes must be a string' });
    } else {
      sanitizedNotes = notes.trim();
      if (sanitizedNotes.length > 300) {
        errors.push({ field: 'notes', message: 'Order notes cannot exceed 300 characters' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedItems,
    notes: sanitizedNotes,
  };
};
