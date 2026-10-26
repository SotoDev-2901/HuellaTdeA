import type { Request, Response, NextFunction } from 'express';
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from './account.schema.js';
import * as accountService from './account.service.js';

export async function getProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({ user: await accountService.getProfile(req.auth!.sub) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = updateProfileSchema.parse(req.body);
    res.status(200).json({ user: await accountService.updateName(req.auth!.sub, name) });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await accountService.changePassword(req.auth!.sub, currentPassword, newPassword);
    res.status(200).json({ message: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = deleteAccountSchema.parse(req.body);
    await accountService.deleteAccount(req.auth!.sub, password);
    res.status(200).json({ message: 'Cuenta eliminada' });
  } catch (err) {
    next(err);
  }
}
