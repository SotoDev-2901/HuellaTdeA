import { Router } from 'express';
import { requireAuth } from '../../shared/middlewares/auth.js';
import { askHandler, optionsHandler, runHandler } from './simulation.controller.js';

export const router = Router();

// El simulador es información de interés para toda la comunidad, no una acción administrativa.
router.use(requireAuth);

router.get('/options', optionsHandler);
router.post('/run', runHandler);
router.post('/ask', askHandler);
