import CafeTable from '../models/CafeTable.js';
import Reservation from '../models/Reservation.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  validateReservationInput,
  timeToMinutes,
  minutesToTime,
  DEFAULT_SLOT_MINUTES,
  WEEKDAY_CLOSING_MINUTES,
  doTimesOverlap,
} from '../utils/reservationValidators.js';

/**
 * GET /api/v1/tables
 * Lists active cafe tables (public endpoint — active only)
 * GET /api/v1/admin/tables (via adminRoutes)
 * Lists ALL cafe tables including inactive (admin endpoint)
 */
export const getTables = async (req, res, next) => {
  try {
    // Admin-authenticated requests (req.user set by protect middleware) see all tables
    const filter = req.user ? {} : { isActive: true };
    const tables = await CafeTable.find(filter).sort({ tableNumber: 1 });
    return sendSuccess(res, 200, { tables, total: tables.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tables/availability
 * Check table availability for a specific date and time window
 * Query: date, startTime, [endTime], guestCount
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { date, startTime, guestCount } = req.query;
    let endTime = req.query.endTime;

    if (!endTime && startTime) {
      const sMin = timeToMinutes(startTime);
      if (sMin !== null) {
        endTime = minutesToTime(Math.min(sMin + DEFAULT_SLOT_MINUTES, WEEKDAY_CLOSING_MINUTES));
      }
    }

    const validation = validateReservationInput({
      reservationDate: date,
      startTime,
      endTime,
      guestCount: guestCount || 2,
    });

    if (!validation.isValid) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid query parameters', validation.errors);
    }

    const partySize = parseInt(guestCount || 2, 10);
    const candidateTables = await CafeTable.find({
      isActive: true,
      capacity: { $gte: partySize },
    }).sort({ capacity: 1 });

    if (candidateTables.length === 0) {
      return sendSuccess(res, 200, {
        isAvailable: false,
        message: `No tables found accommodating party size of ${partySize}`,
        availableTables: [],
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const existingReservations = await Reservation.find({
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed',
      tableId: { $in: candidateTables.map((t) => t._id) },
    });

    const freeTables = candidateTables.filter((table) => {
      const tableBookings = existingReservations.filter((r) => r.tableId.toString() === table._id.toString());
      const hasConflict = tableBookings.some((r) => doTimesOverlap(startTime, endTime, r.startTime, r.endTime));
      return !hasConflict;
    });

    return sendSuccess(res, 200, {
      isAvailable: freeTables.length > 0,
      requestedSlot: { date, startTime, endTime, guestCount: partySize },
      availableTables: freeTables,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/tables
 * Create a new cafe table (Admin only)
 */
export const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, isActive } = req.body;
    if (!tableNumber || !String(tableNumber).trim()) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Table number is required.', [{ field: 'tableNumber' }]);
    }
    const cap = Number(capacity);
    if (isNaN(cap) || cap < 1 || cap > 20) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Capacity must be a number between 1 and 20.', [{ field: 'capacity' }]);
    }
    const existing = await CafeTable.findOne({ tableNumber: String(tableNumber).trim() });
    if (existing) {
      return sendError(res, 409, 'CONFLICT', `Table ${tableNumber} already exists.`, [{ field: 'tableNumber' }]);
    }
    const table = await CafeTable.create({
      tableNumber: String(tableNumber).trim(),
      capacity: cap,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    return sendSuccess(res, 201, { message: 'Table created successfully.', table });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/tables/:id
 * Update table capacity, number, or active status (Admin only)
 */
export const updateTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, isActive } = req.body;
    const table = await CafeTable.findById(id);
    if (!table) {
      return sendError(res, 404, 'NOT_FOUND', 'Table not found.');
    }
    if (tableNumber !== undefined) {
      const trimmed = String(tableNumber).trim();
      if (!trimmed) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Table number cannot be empty.', [{ field: 'tableNumber' }]);
      }
      const existing = await CafeTable.findOne({ tableNumber: trimmed, _id: { $ne: id } });
      if (existing) {
        return sendError(res, 409, 'CONFLICT', `Table ${trimmed} already exists.`, [{ field: 'tableNumber' }]);
      }
      table.tableNumber = trimmed;
    }
    if (capacity !== undefined) {
      const cap = Number(capacity);
      if (isNaN(cap) || cap < 1 || cap > 20) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Capacity must be between 1 and 20.', [{ field: 'capacity' }]);
      }
      table.capacity = cap;
    }
    if (isActive !== undefined) {
      table.isActive = Boolean(isActive);
    }
    await table.save();
    return sendSuccess(res, 200, { message: 'Table updated successfully.', table });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/tables/:id
 * Delete or deactivate table (Admin only)
 */
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const table = await CafeTable.findById(id);
    if (!table) {
      return sendError(res, 404, 'NOT_FOUND', 'Table not found.');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeBookings = await Reservation.countDocuments({
      tableId: id,
      status: 'confirmed',
      reservationDate: { $gte: today },
    });
    if (activeBookings > 0) {
      table.isActive = false;
      await table.save();
      return sendSuccess(res, 200, { message: 'Table has active bookings; marked inactive.', table });
    }
    await CafeTable.findByIdAndDelete(id);
    return sendSuccess(res, 200, { message: 'Table deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
