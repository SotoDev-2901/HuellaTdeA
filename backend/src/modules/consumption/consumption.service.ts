import { AppError } from '../../shared/errors/AppError.js';
import * as zonesRepository from '../zones/zones.repository.js';
import * as consumptionRepository from './consumption.repository.js';
import type { ConsumptionRecord } from './consumption.types.js';
import type { CreateConsumptionInput, UpdateConsumptionInput } from './consumption.schema.js';

export function listConsumptionRecords(): Promise<ConsumptionRecord[]> {
  return consumptionRepository.listConsumptionRecords();
}

export async function createConsumptionRecord(input: CreateConsumptionInput): Promise<ConsumptionRecord> {
  const zone = await zonesRepository.findZoneById(input.zoneId);
  if (!zone) {
    throw new AppError('La zona seleccionada no existe', 404);
  }
  return consumptionRepository.createConsumptionRecord(input);
}

export async function updateConsumptionRecord(
  id: string,
  input: UpdateConsumptionInput,
): Promise<ConsumptionRecord> {
  const existing = await consumptionRepository.findConsumptionById(id);
  if (!existing) {
    throw new AppError('Registro de consumo no encontrado', 404);
  }

  if (input.zoneId) {
    const zone = await zonesRepository.findZoneById(input.zoneId);
    if (!zone) {
      throw new AppError('La zona seleccionada no existe', 404);
    }
  }

  const updated = await consumptionRepository.updateConsumptionRecord(id, input);
  if (!updated) {
    throw new AppError('Registro de consumo no encontrado', 404);
  }
  return updated;
}

export async function deleteConsumptionRecord(id: string): Promise<void> {
  const deleted = await consumptionRepository.deleteConsumptionRecord(id);
  if (!deleted) {
    throw new AppError('Registro de consumo no encontrado', 404);
  }
}
