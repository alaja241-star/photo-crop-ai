import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import config from '../config/index.js';

interface NormalizedError {
  message: string;
  statusCode: number;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  console.error('Error:', err);

  const anyErr = err as {
    name?: string;
    code?: number | string;
    message?: string;
    stack?: string;
    errors?: Record<string, { message: string }>;
  };

  let error: NormalizedError = {
    message: anyErr.message || 'Server Error',
    statusCode: 500,
  };

  // Application-level errors carry their own status code
  if (err instanceof AppError) {
    error = { message: err.message, statusCode: err.statusCode };
  }

  // Mongoose bad ObjectId
  if (anyErr.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  // Mongoose duplicate key
  if (anyErr.code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 };
  }

  // Mongoose validation error
  if (anyErr.name === 'ValidationError' && anyErr.errors) {
    const message = Object.values(anyErr.errors)
      .map((val) => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (anyErr.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  if (anyErr.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  // Multer errors
  if (anyErr.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'File too large', statusCode: 400 };
  }

  if (anyErr.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { message: 'Unexpected file field', statusCode: 400 };
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(config.nodeEnv === 'development' && { stack: anyErr.stack }),
  });
};
