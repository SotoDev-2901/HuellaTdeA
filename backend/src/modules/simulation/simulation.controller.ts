import type { Request, Response, NextFunction } from 'express';
import { askSchema, runSchema } from './simulation.schema.js';
import * as simulationService from './simulation.service.js';

export async function optionsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json(await simulationService.getOptions());
  } catch (err) {
    next(err);
  }
}

export async function runHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { levers } = runSchema.parse(req.body);
    const result = await simulationService.run(levers);
    res.status(200).json({ levers, result, summary: simulationService.summarize(result) });
  } catch (err) {
    next(err);
  }
}

export async function askHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { question } = askSchema.parse(req.body);
    res.status(200).json(await simulationService.ask(req.auth!.sub, question));
  } catch (err) {
    next(err);
  }
}
