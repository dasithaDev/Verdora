import mongoose from 'mongoose';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  validateCreateOrderPayload,
  canTransitionStatus,
  ALLOWED_STATUSES,
  STATUS_TRANSITIONS,
} from '../utils/orderValidators.js';

/**
 * Customer: Place a new order from cart.
 * - Re-fetches each menu item by ID from MongoDB.
 * - Verifies item availability.
 * - Creates immutable item snapshots (name and unit price).
 * - Computes authoritative subtotal on the server (client totals are ignored).
 */
export const createOrder = async (req, res, next) => {
  try {
    const { isValid, errors, sanitizedItems, notes } = validateCreateOrderPayload(req.body);

    if (!isValid) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Please correct the highlighted order fields.',
        errors
      );
    }

    const itemSnapshots = [];
    let serverCalculatedSubtotal = 0;

    for (const item of sanitizedItems) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return sendError(
          res,
          400,
          'ITEM_NOT_FOUND',
          `Menu item with ID '${item.menuItemId}' does not exist in Verdora's catalog.`,
          [{ field: 'menuItemId', received: item.menuItemId }]
        );
      }

      if (menuItem.isAvailable === false) {
        return sendError(
          res,
          400,
          'ITEM_UNAVAILABLE',
          `'${menuItem.name}' is currently marked as unavailable for ordering.`,
          [{ field: 'menuItemId', itemId: menuItem._id, name: menuItem.name }]
        );
      }

      const unitPrice = Number(menuItem.price);
      const lineTotal = unitPrice * item.quantity;
      serverCalculatedSubtotal += lineTotal;

      itemSnapshots.push({
        menuItemId: menuItem._id,
        itemNameSnapshot: menuItem.name,
        unitPriceSnapshot: unitPrice,
        quantity: item.quantity,
      });
    }

    // Round subtotal to 2 decimal places to avoid floating-point drift
    serverCalculatedSubtotal = Math.round(serverCalculatedSubtotal * 100) / 100;

    const newOrder = new Order({
      userId: req.user._id || req.user.id,
      items: itemSnapshots,
      subtotal: serverCalculatedSubtotal,
      notes: notes || '',
      status: 'placed',
    });

    await newOrder.save();

    // Issue 5: use toJSON() so the schema transform strips __v and serializes correctly
    return sendSuccess(res, 201, newOrder.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * Customer: Retrieve own order history.
 * Supports pagination (page, limit).
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page, limit, skip } = req.pagination;

    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ userId }),
    ]);

    return sendSuccess(res, 200, {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer / Admin: Retrieve order details by ID.
 * Ownership check: Customers can only access their own orders. Admins can view any order.
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).lean();

    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', `Order with ID '${id}' was not found.`);
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = order.userId.toString() === currentUserId;

    if (!isOwner && req.user.role !== 'admin') {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Access denied. You do not have permission to view another customer\'s order.'
      );
    }

    return sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Customer / Owner: Cancel an eligible order.
 * Policy: Orders can only be cancelled while in 'placed' status (before preparation starts).
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', `Order with ID '${id}' was not found.`);
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    const isOwner = order.userId.toString() === currentUserId;

    if (!isOwner && req.user.role !== 'admin') {
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'Access denied. You cannot cancel an order belonging to another customer.'
      );
    }

    if (order.status === 'cancelled') {
      return sendError(
        res,
        400,
        'ALREADY_CANCELLED',
        'This order has already been cancelled.'
      );
    }

    if (order.status !== 'placed') {
      return sendError(
        res,
        400,
        'CANCELLATION_CUTOFF',
        `Cannot cancel order once preparation has begun. Current status is '${order.status}'.`
      );
    }

    order.status = 'cancelled';
    await order.save();

    return sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all cafe orders with status filter and pagination.
 */
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { status, userId } = req.query;

    const query = {};

    if (status && ALLOWED_STATUSES.includes(status)) {
      query.status = status;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return sendSuccess(res, 200, {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update order status adhering to the strict State Transition Matrix.
 */
export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `Invalid status '${status}'. Must be one of [${ALLOWED_STATUSES.join(', ')}].`
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return sendError(res, 404, 'NOT_FOUND', `Order with ID '${id}' was not found.`);
    }

    if (order.status === status) {
      return sendSuccess(res, 200, order);
    }

    if (!canTransitionStatus(order.status, status)) {
      const allowedNext = STATUS_TRANSITIONS[order.status] || [];
      return sendError(
        res,
        400,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition order from '${order.status}' to '${status}'. Allowed transitions: [${allowedNext.join(', ') || 'none (terminal state)'}].`
      );
    }

    order.status = status;
    await order.save();

    return sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
};
