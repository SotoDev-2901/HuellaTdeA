import { Router } from 'express';
import { requireAuth } from '../../shared/middlewares/auth.js';
import { listMyResponsesHandler, submitQuestionnaireHandler } from './questionnaire.controller.js';

export const router = Router();

router.use(requireAuth);

router.post('/', submitQuestionnaireHandler);
router.get('/', listMyResponsesHandler);
