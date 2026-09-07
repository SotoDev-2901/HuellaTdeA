import { AppError } from '../../shared/errors/AppError.js';
import * as zonesRepository from './zones.repository.js';
import type { Zone } from './zones.types.js';
import type { CreateZoneInput, UpdateZoneInput } from './zones.schema.js';

export function listZones(): Promise<Zone[]> {
  return zonesRepository.listZones();
}

export async function createZone(input: CreateZoneInput): Promise<Zone> {
  const existing = await zonesRepository.findZoneByName(input.name);
  if (existing) {
    throw new AppError('Ya existe una zona con ese nombre', 409);
  }
  return zonesRepository.createZone(input);
}

export async function updateZone(id: string, input: UpdateZoneInput): Promise<Zone> {
  const zone = await zonesRepository.findZoneById(id);
  if (!zone) {
    throw new AppError('Zona no encontrada', 404);
  }

  if (input.name) {
    const existing = await zonesRepository.findZoneByName(input.name);
    if (existing && existing.id !== id) {
      throw new AppError('Ya existe una zona con ese nombre', 409);
    }
  }

  const updated = await zonesRepository.updateZone(id, input);
  if (!updated) {
    throw new AppError('Zona no encontrada', 404);
  }
  return updated;
}

export async function deleteZone(id: string): Promise<void> {
  const deleted = await zonesRepository.deleteZone(id);
  if (!deleted) {
    throw new AppError('Zona no encontrada', 404);
  }
}
