import type { Request, Response, NextFunction } from 'express';
import * as dashboardRepository from '../questionnaire/dashboard.repository.js';
import * as recommendationsService from './recommendations.service.js';

export async function getRecommendationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const latestPerUser = await dashboardRepository.getLatestResponsePerUser();
    const totals = latestPerUser.map(
      (row) =>
        Number(row.transport_kg_co2e) +
        Number(row.facilities_kg_co2e) +
        Number(row.devices_kg_co2e) +
        Number(row.waste_kg_co2e),
    );
    const average = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
    const result = await recommendationsService.getRecommendations(req.auth!.sub, average);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
