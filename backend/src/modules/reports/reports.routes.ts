import { Router } from 'express';
import { requireAuth } from '../../shared/middlewares/auth.js';
import { getInstitutionalReportHandler, getInstitutionalSummaryHandler } from './reports.controller.js';

export const router = Router();

// Cualquier usuario autenticado (estudiante, docente o administrador) puede consultar
// la huella institucional — es información de transparencia, no una acción administrativa.
router.use(requireAuth);

router.get('/institutional', getInstitutionalReportHandler);
router.get('/institutional-summary', getInstitutionalSummaryHandler);
