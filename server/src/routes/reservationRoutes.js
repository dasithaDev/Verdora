import express from 'express';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer endpoints (require authentication)
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, getReservationById);
router.patch('/:id', protect, updateReservation);
router.patch('/:id/cancel', protect, cancelReservation);

// Admin reservation management is mounted directly on /admin/reservations in api.js
// to avoid the /:id shadow conflict that would occur if defined here.

export default router;

