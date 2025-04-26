import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadNotificationCount
} from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', getNotifications);

// Get a specific notification
router.get('/:id', getNotificationById);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Create a new notification
router.post('/', createNotification);

// Delete a notification
router.delete('/:id', deleteNotification);

// Get unread notification count
router.get('/unread/count', getUnreadNotificationCount);

export default router; 