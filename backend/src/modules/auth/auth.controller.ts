import type { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const { user } = await authService.register(input);
    res.status(201).json({
      user,
      message: 'Cuenta creada. Revisa tu correo institucional para verificarla antes de iniciar sesión.',
    });
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

export async function verifyEmailHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    await authService.verifyEmail(token);
    res.status(200).json({ message: 'Correo verificado correctamente' });
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    await authService.resendVerification(email);
    res.status(200).json({ message: 'Si el correo existe y no ha sido verificado, enviamos un nuevo enlace.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(input);
    res.status(200).json({ message: 'Si el correo existe, enviamos instrucciones para recuperar tu contraseña.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(input);
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
}
