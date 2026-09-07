import express from 'express';
import cors from 'cors';

import { router as authRouter } from './modules/auth/auth.routes.js';
import { router as zonesRouter } from './modules/zones/zones.routes.js';
import { router as questionnaireRouter } from './modules/questionnaire/questionnaire.routes.js';
import { router as consumptionRouter } from './modules/consumption/consumption.routes.js';
import { router as footprintRouter } from './modules/footprint/footprint.routes.js';
import { router as reportsRouter } from './modules/reports/reports.routes.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/footprint', footprintRouter);
app.use('/api/reports', reportsRouter);

app.use(errorHandler);
