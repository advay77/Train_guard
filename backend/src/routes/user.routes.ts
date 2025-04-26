import express from 'express';
import { check } from 'express-validator';
import { auth } from '../middleware/auth.middleware';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
} from '../controllers/user.controller';

const router = express.Router();

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, getProfile);

// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
router.put(
  '/me',
  [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Please include a valid phone number').isMobilePhone('any')
  ],
  updateProfile
);

// @route   GET api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', auth, getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', auth, getUserById);

export default router; 