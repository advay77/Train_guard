import express from 'express';
import { check } from 'express-validator';
import { auth } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking
} from '../controllers/booking.controller';

const router = express.Router();

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post(
  '/',
  [
    auth,
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('duration', 'Duration is required and must be at least 1 hour').isInt({ min: 1 }),
    check('location', 'Location is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ],
  createBooking
);

// @route   GET api/bookings
// @desc    Get all bookings
// @access  Private
router.get('/', auth, getBookings);

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, getBookingById);

// @route   PUT api/bookings/:id
// @desc    Update booking
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('status', 'Status must be pending, confirmed, completed, or cancelled')
      .optional()
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
  ],
  updateBooking
);

export default router; 