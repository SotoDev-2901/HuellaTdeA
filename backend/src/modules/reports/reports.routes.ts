import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js';
import { getInstitutionalReportHandler } from './reports.controller.js';

export const router = Router();

router.use(requireAuth, requireRole('administrador'));

router.get('/institutional', getInstitutionalReportHandler);
