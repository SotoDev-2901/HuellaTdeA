import type { Request, Response, NextFunction } from 'express';
import { createWasteSchema, updateWasteSchema } from './waste.schema.js';
import * as wasteService from './waste.service.js';

export async function listWasteHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const records = await wasteService.listWasteRecords();
    res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
}

export async function createWasteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createWasteSchema.parse(req.body);
    const record = await wasteService.createWasteRecord(input);
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
}

export async function updateWasteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateWasteSchema.parse(req.body);
    const record = await wasteService.updateWasteRecord(req.params.id, input);
    res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
}

export async function deleteWasteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await wasteService.deleteWasteRecord(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
