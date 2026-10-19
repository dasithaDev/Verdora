import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';
import CafeTable from '../models/CafeTable.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  validateReservationInput,
  timeToMinutes,
  minutesToTime,
  DEFAULT_SLOT_MINUTES,
  CLOSING_HOUR_MINUTES,
  doTimesOverlap,
  RESERVATION_TRANSITIONS,
} from '../utils/reservationValidators.js';

/**
 * POST /api/v1/reservations
 * Creates a new table reservation with server-side conflict detection
 */
export const createReservation = async (req, res) => {
  try {
    const { reservationDate, startTime, guestCount, tableId, specialRequest } = req.body;
    let endTime = req.body.endTime;

    // Calculate default end time if not explicitly provided (90 mins slot)
    if (!endTime && startTime) {
      const sMin = timeToMinutes(startTime);
      if (sMin !== null) {
        endTime = minutesToTime(Math.min(sMin + DEFAULT_SLOT_MINUTES, CLOSING_HOUR_MINUTES));
      }
    }

    const validation = validateReservationInput({
      reservationDate,
      startTime,
      endTime,
      guestCount,
      specialRequest,
    });

    if (!validation.isValid) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid reservation request', validation.errors);
    }

    const partySize = parseInt(guestCount, 10);
    const targetDate = new Date(reservationDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    let assignedTable;

    // A. Explicit table requested
    if (tableId) {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed table ID');
      }

      const table = await CafeTable.findById(tableId);
      if (!table || !table.isActive) {
        return sendError(res, 400, 'TABLE_UNAVAILABLE', 'Requested table does not exist or is inactive');
      }

      if (table.capacity < partySize) {
        return sendError(
          res,
          400,
          'INSUFFICIENT_CAPACITY',
          `Selected table capacity (${table.capacity}) cannot accommodate ${partySize} guests`
        );
      }

      // Check conflict on this table
      const conflicts = await Reservation.find({
        tableId: table._id,
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'confirmed',
      });

      const hasConflict = conflicts.some((r) => doTimesOverlap(startTime, endTime, r.startTime, r.endTime));
      if (hasConflict) {
        return sendError(
          res,
          409,
          'RESERVATION_CONFLICT',
          `Table ${table.tableNumber} is already booked for the requested time slot (${startTime} - ${endTime})`
        );
      }

      assignedTable = table;
    } else {
      // B. Smart Table Allocation: find matching active tables
      const candidateTables = await CafeTable.find({
        isActive: true,
        capacity: { $gte: partySize },
      }).sort({ capacity: 1, tableNumber: 1 });

      if (candidateTables.length === 0) {
        return sendError(
          res,
          400,
          'NO_SUITABLE_TABLE',
          `No active tables available that can accommodate ${partySize} guests`
        );
      }

      // Find candidate table without conflict
      const candidateIds = candidateTables.map((t) => t._id);
      const existingBookings = await Reservation.find({
        tableId: { $in: candidateIds },
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'confirmed',
      });

      for (const table of candidateTables) {
        const tableBookings = existingBookings.filter((b) => b.tableId.toString() === table._id.toString());
        const hasConflict = tableBookings.some((b) => doTimesOverlap(startTime, endTime, b.startTime, b.endTime));
        if (!hasConflict) {
          assignedTable = table;
          break;
        }
      }

      if (!assignedTable) {
        return sendError(
          res,
          409,
          'RESERVATION_CONFLICT',
          `All tables accommodating ${partySize} guests are booked for ${startTime} - ${endTime}. Please try another slot.`
        );
      }
    }

    // Persist reservation
    const reservation = await Reservation.create({
      userId: req.user._id,
      tableId: assignedTable._id,
      reservationDate: startOfDay,
      startTime,
      endTime,
      guestCount: partySize,
      specialRequest: specialRequest ? specialRequest.trim() : '',
      status: 'confirmed',
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('tableId', 'tableNumber capacity')
      .populate('userId', 'name email');

    return sendSuccess(res, 201, populatedReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to create reservation');
  }
};

/**
 * GET /api/v1/reservations/my
 * Customer: Retrieve own reservation history
 */
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('tableId', 'tableNumber capacity')
      .sort({ reservationDate: -1, startTime: -1 });

    return sendSuccess(res, 200, {
      reservations,
      total: reservations.length,
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to retrieve your reservations');
  }
};

/**
 * GET /api/v1/reservations/:id
 * Customer (owner) or Admin: Retrieve single reservation details
 */
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed reservation ID');
    }

    const reservation = await Reservation.findById(id)
      .populate('tableId', 'tableNumber capacity')
      .populate('userId', 'name email');

    if (!reservation) {
      return sendError(res, 404, 'NOT_FOUND', 'Reservation not found');
    }

    // Ownership check
    const isOwner = reservation.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'Access denied to this reservation');
    }

    return sendSuccess(res, 200, reservation);
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to retrieve reservation');
  }
};

/**
 * PATCH /api/v1/reservations/:id
 * Customer: Edit an existing confirmed reservation (subject to conflict re-validation)
 */
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed reservation ID');
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return sendError(res, 404, 'NOT_FOUND', 'Reservation not found');
    }

    // Must be owner or admin
    const isOwner = reservation.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to edit this reservation');
    }

    if (reservation.status !== 'confirmed') {
      return sendError(
        res,
        400,
        'CANNOT_EDIT_RESERVATION',
        `Cannot edit reservation with status '${reservation.status}'`
      );
    }

    const newDate = req.body.reservationDate || reservation.reservationDate;
    const newStart = req.body.startTime || reservation.startTime;
    const newEnd = req.body.endTime || reservation.endTime;
    const newGuests = req.body.guestCount ? parseInt(req.body.guestCount, 10) : reservation.guestCount;

    const validation = validateReservationInput({
      reservationDate: newDate,
      startTime: newStart,
      endTime: newEnd,
      guestCount: newGuests,
      specialRequest: req.body.specialRequest,
    });

    if (!validation.isValid) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid update parameters', validation.errors);
    }

    const targetDate = new Date(newDate);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // Verify table capacity
    const table = await CafeTable.findById(reservation.tableId);
    if (!table || table.capacity < newGuests) {
      return sendError(
        res,
        400,
        'INSUFFICIENT_CAPACITY',
        `Current table capacity (${table?.capacity}) cannot accommodate ${newGuests} guests`
      );
    }

    // Check conflict excluding self
    const conflicts = await Reservation.find({
      _id: { $ne: reservation._id },
      tableId: reservation.tableId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed',
    });

    const hasConflict = conflicts.some((c) => doTimesOverlap(newStart, newEnd, c.startTime, c.endTime));
    if (hasConflict) {
      return sendError(
        res,
        409,
        'RESERVATION_CONFLICT',
        `Table is already booked during ${newStart} - ${newEnd} on that date`
      );
    }

    reservation.reservationDate = startOfDay;
    reservation.startTime = newStart;
    reservation.endTime = newEnd;
    reservation.guestCount = newGuests;
    if (req.body.specialRequest !== undefined) {
      reservation.specialRequest = req.body.specialRequest.trim();
    }

    await reservation.save();

    const updated = await Reservation.findById(reservation._id)
      .populate('tableId', 'tableNumber capacity')
      .populate('userId', 'name email');

    return sendSuccess(res, 200, updated);
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to update reservation');
  }
};

/**
 * PATCH /api/v1/reservations/:id/cancel
 * Customer or Admin: Cancel a confirmed reservation and free the slot
 */
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed reservation ID');
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return sendError(res, 404, 'NOT_FOUND', 'Reservation not found');
    }

    const isOwner = reservation.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to cancel this reservation');
    }

    if (reservation.status === 'cancelled') {
      return sendError(res, 400, 'ALREADY_CANCELLED', 'Reservation is already cancelled');
    }

    if (reservation.status !== 'confirmed') {
      return sendError(
        res,
        400,
        'CANNOT_CANCEL',
        `Cannot cancel reservation with status '${reservation.status}'`
      );
    }

    reservation.status = 'cancelled';
    await reservation.save();

    return sendSuccess(res, 200, {
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to cancel reservation');
  }
};

/**
 * GET /api/v1/admin/reservations
 * Admin: List all reservations with filtering & pagination
 */
export const getAllReservationsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.date) {
      const targetDate = new Date(req.query.date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
        filter.reservationDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .populate('tableId', 'tableNumber capacity')
      .populate('userId', 'name email')
      .sort({ reservationDate: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, {
      reservations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to query reservations');
  }
};

/**
 * PATCH /api/v1/admin/reservations/:id/status
 * Admin: Update reservation status following strict transition rules
 */
export const updateReservationStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed reservation ID');
    }

    if (!status) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Status is required');
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return sendError(res, 404, 'NOT_FOUND', 'Reservation not found');
    }

    const currentStatus = reservation.status;
    const allowedNext = RESERVATION_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      return sendError(
        res,
        400,
        'INVALID_STATE_TRANSITION',
        `Cannot transition reservation status from '${currentStatus}' to '${status}'`
      );
    }

    reservation.status = status;
    await reservation.save();

    return sendSuccess(res, 200, {
      message: `Reservation status transitioned from ${currentStatus} to ${status}`,
      reservation,
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to update reservation status');
  }
};
