import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const { user, token } = await authService.register(input);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const { user, token } = await authService.login(input);
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}
