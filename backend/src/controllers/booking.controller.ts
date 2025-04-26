import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { io } from '../index';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      guardId,
      startTime,
      endTime,
      location,
      specialInstructions,
      amount
    } = req.body;

    // Check for booking conflicts
    const existingBooking = await Booking.findOne({
      guardId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Guard is already booked for this time period'
      });
    }

    const booking = new Booking({
      userId: req.user?.id,
      guardId,
      startTime,
      endTime,
      location,
      specialInstructions,
      amount
    });

    await booking.save();

    // Create notifications for both user and guard
    const userNotification = new Notification({
      userId: req.user?.id,
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking with guard has been created for ${location}`,
      priority: 'medium',
      metadata: {
        bookingId: booking._id
      }
    });

    const guardNotification = new Notification({
      userId: guardId,
      type: 'booking',
      title: 'New Booking Request',
      message: `You have a new booking request for ${location}`,
      priority: 'medium',
      metadata: {
        bookingId: booking._id
      }
    });

    await Promise.all([
      userNotification.save(),
      guardNotification.save()
    ]);

    // Emit real-time notifications
    if (req.user?.id) {
      io.to(req.user.id.toString()).emit('notification', userNotification);
    }
    io.to(guardId.toString()).emit('notification', guardNotification);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query: any = {};

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (status) {
      query.status = status;
    }

    // If user is not admin, only show their bookings
    if (req.user?.role !== 'admin') {
      query.$or = [
        { userId: req.user?.id },
        { guardId: req.user?.id }
      ];
    }

    const bookings = await Booking.find(query)
      .sort({ startTime: 1 })
      .populate('userId', 'firstName lastName email')
      .populate('guardId', 'firstName lastName email');

    res.json({
      success: true,
      data: bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('guardId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update
    if (
      req.user?.role !== 'admin' &&
      req.user?.id.toString() !== booking.guardId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    booking.status = status;
    await booking.save();

    // Create notification for status update
    const notification = new Notification({
      userId: booking.userId,
      type: 'booking',
      title: 'Booking Status Updated',
      message: `Your booking status has been updated to ${status}`,
      priority: 'medium',
      metadata: {
        bookingId: booking._id
      }
    });

    await notification.save();

    // Emit real-time notification
    if (req.user?.id) {
      io.to(req.user.id.toString()).emit('notification', notification);
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('guardId', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view
    if (
      req.user?.role !== 'admin' &&
      req.user?.id.toString() !== booking.userId.toString() &&
      req.user?.id.toString() !== booking.guardId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { status, guardId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to update this booking
    if (
      req.user?.role !== 'admin' &&
      req.user?.id &&
      req.user.id.toString() !== booking.userId.toString() &&
      req.user.id.toString() !== booking.guardId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (status) booking.status = status;
    if (guardId) booking.guardId = guardId;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 