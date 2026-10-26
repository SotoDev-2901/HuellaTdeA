import { Router } from 'express';
import { requireAuth } from '../../shared/middlewares/auth.js';
import { getMethodology } from './emissionFactors.js';

export const router = Router();

router.use(requireAuth);

// Factores y supuestos que usa el cálculo, para la página "¿Cómo se calcula?".
router.get('/methodology', (_req, res) => {
  res.status(200).json(getMethodology());
});
