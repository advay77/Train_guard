import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  guardId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialInstructions?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
}

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guardId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  specialInstructions: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ guardId: 1, status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema); 