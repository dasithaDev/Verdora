import express from 'express';
import {
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  getAllReservationsAdmin,
  updateReservationStatusAdmin,
} from '../controllers/reservationController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer endpoints (require authentication)
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, getReservationById);
router.patch('/:id', protect, updateReservation);
router.patch('/:id/cancel', protect, cancelReservation);

// Admin-only endpoints
router.get('/admin/all', protect, requireRole('admin'), getAllReservationsAdmin);
router.patch('/admin/:id/status', protect, requireRole('admin'), updateReservationStatusAdmin);

export default router;

