import type { Request, Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service.js';

export async function getDashboardHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const dashboard = await dashboardService.getPersonalDashboard(req.auth!.sub);
    res.status(200).json(dashboard);
  } catch (err) {
    next(err);
  }
}
