import { Router } from 'express';
import { requireAuth } from '../../shared/middlewares/auth.js';
import {
  changePasswordHandler,
  deleteAccountHandler,
  getProfileHandler,
  updateProfileHandler,
} from './account.controller.js';

export const router = Router();

router.use(requireAuth);

router.get('/', getProfileHandler);
router.patch('/', updateProfileHandler);
router.post('/change-password', changePasswordHandler);
// POST y no DELETE porque la confirmación con contraseña viaja en el cuerpo de la petición.
router.post('/delete', deleteAccountHandler);
