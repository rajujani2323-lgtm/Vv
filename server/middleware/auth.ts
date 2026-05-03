import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.ts';

export const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    if (token === 'null' || token === 'undefined') {
       return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if user is blocked or exists in DB
    try {
      // Validate if ID is a valid MongoDB ObjectId to avoid CastError
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'User not found. Please log in again.' });
        }
        if (user.status === 'blocked') {
          return res.status(403).json({ message: 'Your account has been blocked.' });
        }
      } else {
        // If ID is not a valid ObjectId (e.g. "admin-id" from dev/mock), 
        // we trust the decoded token if it has role info, or reject if it needs DB validation
        console.warn(`Auth: Invalid ObjectId skipped for DB check: ${decoded.id}`);
      }
      
      req.user = decoded;
      next();
    } catch (dbErr) {
      console.error("Auth DB Error:", dbErr);
      // Fallback for when DB is offline during auth check
      req.user = decoded;
      next();
    }
  } catch (err: any) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
