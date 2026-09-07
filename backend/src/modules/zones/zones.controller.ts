import type { Request, Response, NextFunction } from 'express';
import { createZoneSchema, updateZoneSchema } from './zones.schema.js';
import * as zonesService from './zones.service.js';

export async function listZonesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await zonesService.listZones();
    res.status(200).json({ zones });
  } catch (err) {
    next(err);
  }
}

export async function createZoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createZoneSchema.parse(req.body);
    const zone = await zonesService.createZone(input);
    res.status(201).json({ zone });
  } catch (err) {
    next(err);
  }
}

export async function updateZoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateZoneSchema.parse(req.body);
    const zone = await zonesService.updateZone(req.params.id, input);
    res.status(200).json({ zone });
  } catch (err) {
    next(err);
  }
}

export async function deleteZoneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await zonesService.deleteZone(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
