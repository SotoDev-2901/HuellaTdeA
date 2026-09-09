import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js';
import {
  createWasteHandler,
  deleteWasteHandler,
  listWasteHandler,
  updateWasteHandler,
} from './waste.controller.js';

export const router = Router();

router.use(requireAuth, requireRole('administrador'));

router.get('/', listWasteHandler);
router.post('/', createWasteHandler);
router.patch('/:id', updateWasteHandler);
router.delete('/:id', deleteWasteHandler);
