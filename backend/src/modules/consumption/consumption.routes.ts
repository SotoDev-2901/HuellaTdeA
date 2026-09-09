import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js';
import {
  createConsumptionHandler,
  deleteConsumptionHandler,
  listConsumptionHandler,
  updateConsumptionHandler,
} from './consumption.controller.js';

export const router = Router();

router.use(requireAuth, requireRole('administrador'));

router.get('/', listConsumptionHandler);
router.post('/', createConsumptionHandler);
router.patch('/:id', updateConsumptionHandler);
router.delete('/:id', deleteConsumptionHandler);
