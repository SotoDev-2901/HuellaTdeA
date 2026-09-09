import type { Request, Response, NextFunction } from 'express';
import { institutionalReportQuerySchema } from './reports.schema.js';
import * as reportsService from './reports.service.js';

export async function getInstitutionalReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = institutionalReportQuerySchema.parse(req.query);
    const zones = await reportsService.getInstitutionalReport(query.from, query.to);
    res.status(200).json({ zones });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionalSummaryHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await reportsService.getInstitutionalSummary();
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}
