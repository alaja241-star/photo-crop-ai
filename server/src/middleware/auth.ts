import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import config from '../config/index.js';

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Protect routes - require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No user found with this token',
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

/**
 * Grant access to specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `User role ${req.user?.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = await User.findById(decoded.id);
    } catch {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }
  }

  next();
};
