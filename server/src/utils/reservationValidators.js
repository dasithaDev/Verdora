/**
 * Reservation Validation & Conflict Utilities
 * Verdora Healthy Cafe & Kitchen
 */

export const OPENING_HOUR_MINUTES = 8 * 60; // 08:00 AM (480 minutes)
export const CLOSING_HOUR_MINUTES = 22 * 60; // 22:00 PM (1320 minutes)
export const DEFAULT_SLOT_MINUTES = 90; // 1.5 hours standard slot

/**
 * Valid state transitions for reservations
 */
export const RESERVATION_TRANSITIONS = {
  confirmed: ['completed', 'cancelled', 'rejected'],
  completed: [],
  cancelled: [],
  rejected: [],
};

/**
 * Parses 'HH:mm' string into minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
};

/**
 * Formats minutes from midnight into 'HH:mm' string
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Checks if two time windows overlap
 * Window 1: [s1, e1], Window 2: [s2, e2]
 * Overlap occurs if max(s1, s2) < min(e1, e2)
 */
export const doTimesOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  if (s1 === null || e1 === null || s2 === null || e2 === null) return false;
  return Math.max(s1, s2) < Math.min(e1, e2);
};

/**
 * Normalizes Date to midnight UTC/local calendar day
 */
export const normalizeToCalendarDate = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Validates reservation creation payload
 */
export const validateReservationInput = (body) => {
  const errors = [];

  // 1. Date validation
  if (!body.reservationDate) {
    errors.push({ field: 'reservationDate', message: 'Reservation date is required' });
  } else {
    const resDate = new Date(body.reservationDate);
    if (isNaN(resDate.getTime())) {
      errors.push({ field: 'reservationDate', message: 'Invalid reservation date format' });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(resDate);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        errors.push({ field: 'reservationDate', message: 'Cannot book reservations in the past' });
      }
    }
  }

  // 2. Start time validation
  const startMin = timeToMinutes(body.startTime);
  if (startMin === null) {
    errors.push({ field: 'startTime', message: 'Start time must be formatted as HH:mm (24-hour)' });
  } else if (startMin < OPENING_HOUR_MINUTES || startMin >= CLOSING_HOUR_MINUTES) {
    errors.push({
      field: 'startTime',
      message: 'Start time must be within cafe opening hours (08:00 - 22:00)',
    });
  }

  // 3. End time validation (optional: calculated automatically if not provided)
  let endMin = null;
  if (body.endTime) {
    endMin = timeToMinutes(body.endTime);
    if (endMin === null) {
      errors.push({ field: 'endTime', message: 'End time must be formatted as HH:mm (24-hour)' });
    } else if (endMin > CLOSING_HOUR_MINUTES) {
      errors.push({
        field: 'endTime',
        message: 'End time cannot exceed cafe closing time (22:00)',
      });
    } else if (startMin !== null && endMin <= startMin) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }
  }

  // 4. Guest count validation
  const guests = parseInt(body.guestCount, 10);
  if (isNaN(guests) || guests < 1) {
    errors.push({ field: 'guestCount', message: 'Guest count must be at least 1' });
  } else if (guests > 20) {
    errors.push({ field: 'guestCount', message: 'Maximum party size is 20 guests' });
  }

  // 5. Special request length
  if (body.specialRequest && body.specialRequest.length > 300) {
    errors.push({ field: 'specialRequest', message: 'Special request cannot exceed 300 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
