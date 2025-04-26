import express from 'express';
import { auth } from '../middleware/auth.middleware';
import {
  createSecurityLog,
  getSecurityLogs,
  getSecurityLogById
} from '../controllers/securityLog.controller';

const router = express.Router();

// @route   POST api/security-logs
// @desc    Create a security log
// @access  Private
router.post('/', auth, createSecurityLog);

// @route   GET api/security-logs
// @desc    Get all security logs for current user
// @access  Private
router.get('/', auth, getSecurityLogs);

// @route   GET api/security-logs/:id
// @desc    Get security log by ID
// @access  Private
router.get('/:id', auth, getSecurityLogById);

export default router; 