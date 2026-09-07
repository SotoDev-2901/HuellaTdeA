import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js';
import { createZoneHandler, listZonesHandler, updateZoneHandler } from './zones.controller.js';

export const router = Router();

router.use(requireAuth, requireRole('administrador'));

router.get('/', listZonesHandler);
router.post('/', createZoneHandler);
router.patch('/:id', updateZoneHandler);
