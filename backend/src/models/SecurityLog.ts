import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityLog extends Document {
  eventType: 'intrusion' | 'motion' | 'face_recognition' | 'system' | 'alert';
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'investigating';
  userId?: mongoose.Types.ObjectId;
  metadata: Record<string, any>;
}

const securityLogSchema = new Schema<ISecurityLog>({
  eventType: {
    type: String,
    enum: ['intrusion', 'motion', 'face_recognition', 'system', 'alert'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'investigating'],
    default: 'pending'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export const SecurityLog = mongoose.model<ISecurityLog>('SecurityLog', securityLogSchema); 