import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  type: string;
  message: string;
  data?: any;
  userId: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['booking', 'security', 'system', 'alert']
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the schema and model
export { notificationSchema };
export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema); 