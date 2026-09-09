import type { Request, Response, NextFunction } from 'express';
import { createConsumptionSchema, updateConsumptionSchema } from './consumption.schema.js';
import * as consumptionService from './consumption.service.js';

export async function listConsumptionHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const records = await consumptionService.listConsumptionRecords();
    res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
}

export async function createConsumptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createConsumptionSchema.parse(req.body);
    const record = await consumptionService.createConsumptionRecord(input);
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
}

export async function updateConsumptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateConsumptionSchema.parse(req.body);
    const record = await consumptionService.updateConsumptionRecord(req.params.id, input);
    res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
}

export async function deleteConsumptionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await consumptionService.deleteConsumptionRecord(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
