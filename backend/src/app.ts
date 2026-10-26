import express from 'express';
import cors from 'cors';

import { router as authRouter } from './modules/auth/auth.routes.js';
import { router as zonesRouter } from './modules/zones/zones.routes.js';
import { router as questionnaireRouter } from './modules/questionnaire/questionnaire.routes.js';
import { router as consumptionRouter } from './modules/consumption/consumption.routes.js';
import { router as wasteRouter } from './modules/consumption/waste.routes.js';
import { router as footprintRouter } from './modules/footprint/footprint.routes.js';
import { router as reportsRouter } from './modules/reports/reports.routes.js';
import { router as accountRouter } from './modules/account/account.routes.js';
import { router as simulationRouter } from './modules/simulation/simulation.routes.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

export const app = express();

// Solo el frontend configurado puede llamar a la API desde un navegador (peticiones sin Origin, como curl o las pruebas, pasan).
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Chequeo de salud con base de datos, para el monitor del hosting.
app.get('/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/waste', wasteRouter);
app.use('/api/footprint', footprintRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/account', accountRouter);
app.use('/api/simulations', simulationRouter);

app.use(errorHandler);
