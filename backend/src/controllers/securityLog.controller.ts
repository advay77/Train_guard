import { Request, Response } from 'express';
import SecurityLog from '../models/securityLog.model';
import { io } from '../index';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const createSecurityLog = async (req: AuthRequest, res: Response) => {
  try {
    const { type, description, location } = req.body;
    const securityLog = new SecurityLog({
      type,
      description,
      location,
      userId: req.user?.id
    });

    await securityLog.save();

    // Emit real-time notification
    const notification = {
      type: 'security',
      message: `New security log created: ${type}`,
      data: securityLog
    };

    if (req.user?.id) {
      io.to(req.user.id.toString()).emit('notification', notification);
    }

    res.status(201).json(securityLog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSecurityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const securityLogs = await SecurityLog.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });
    res.json(securityLogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSecurityLogById = async (req: Request, res: Response) => {
  try {
    const securityLog = await SecurityLog.findById(req.params.id);
    if (!securityLog) {
      return res.status(404).json({ message: 'Security log not found' });
    }
    res.json(securityLog);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 