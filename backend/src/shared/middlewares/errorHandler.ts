import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0]?.message ?? 'Datos inválidos' });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor' });
}
