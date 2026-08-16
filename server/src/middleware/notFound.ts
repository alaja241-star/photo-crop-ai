import type { Request, Response, NextFunction } from 'express';

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
