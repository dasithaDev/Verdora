import express from 'express';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// Customer endpoints (require authentication)
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, validateObjectId('id'), getReservationById);
router.patch('/:id', protect, validateObjectId('id'), updateReservation);
router.patch('/:id/cancel', protect, validateObjectId('id'), cancelReservation);

// Admin reservation management is mounted directly on /admin/reservations in api.js
// to avoid the /:id shadow conflict that would occur if defined here.

export default router;

