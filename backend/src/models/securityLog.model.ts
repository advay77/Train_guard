import mongoose from 'mongoose';

export interface ISecurityLog extends mongoose.Document {
  type: string;
  description: string;
  location: string;
  userId: string;
  createdAt: Date;
}

const securityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['intrusion', 'alert', 'warning', 'info']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the schema and model
export { securityLogSchema };
export default mongoose.models.SecurityLog || mongoose.model<ISecurityLog>('SecurityLog', securityLogSchema); 