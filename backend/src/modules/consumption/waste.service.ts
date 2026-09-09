import { AppError } from '../../shared/errors/AppError.js';
import * as zonesRepository from '../zones/zones.repository.js';
import * as wasteRepository from './waste.repository.js';
import type { WasteRecord } from './waste.types.js';
import type { CreateWasteInput, UpdateWasteInput } from './waste.schema.js';

export function listWasteRecords(): Promise<WasteRecord[]> {
  return wasteRepository.listWasteRecords();
}

export async function createWasteRecord(input: CreateWasteInput): Promise<WasteRecord> {
  const zone = await zonesRepository.findZoneById(input.zoneId);
  if (!zone) {
    throw new AppError('La zona seleccionada no existe', 404);
  }
  return wasteRepository.createWasteRecord(input);
}

export async function updateWasteRecord(id: string, input: UpdateWasteInput): Promise<WasteRecord> {
  const existing = await wasteRepository.findWasteById(id);
  if (!existing) {
    throw new AppError('Registro de residuos no encontrado', 404);
  }

  if (input.zoneId) {
    const zone = await zonesRepository.findZoneById(input.zoneId);
    if (!zone) {
      throw new AppError('La zona seleccionada no existe', 404);
    }
  }

  const updated = await wasteRepository.updateWasteRecord(id, input);
  if (!updated) {
    throw new AppError('Registro de residuos no encontrado', 404);
  }
  return updated;
}

export async function deleteWasteRecord(id: string): Promise<void> {
  const deleted = await wasteRepository.deleteWasteRecord(id);
  if (!deleted) {
    throw new AppError('Registro de residuos no encontrado', 404);
  }
}
