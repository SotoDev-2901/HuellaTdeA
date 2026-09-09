import {
  ELECTRICITY_KG_CO2E_PER_KWH,
  WASTE_KG_CO2E_PER_KG,
} from '../footprint/emissionFactors.js';
import { getLatestResponsePerUser } from '../questionnaire/dashboard.repository.js';
import * as reportsRepository from './reports.repository.js';
import type { InstitutionalSummary, ZoneFootprintSummary } from './reports.types.js';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthsAgo(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() - months);
  return result;
}

function institutionalKgCo2e(kwh: number, wasteKg: number): number {
  return kwh * ELECTRICITY_KG_CO2E_PER_KWH + wasteKg * WASTE_KG_CO2E_PER_KG;
}

export async function getInstitutionalReport(from?: string, to?: string): Promise<ZoneFootprintSummary[]> {
  const zoneTotals = await reportsRepository.getZoneTotals(from, to);

  return zoneTotals.map((zone) => {
    const totalKwh = Number(zone.total_kwh);
    const totalWasteKg = Number(zone.total_waste_kg);
    const electricityKgCo2e = round2(totalKwh * ELECTRICITY_KG_CO2E_PER_KWH);
    const wasteKgCo2e = round2(totalWasteKg * WASTE_KG_CO2E_PER_KG);

    return {
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      total_kwh: totalKwh,
      total_waste_kg: totalWasteKg,
      electricity_kg_co2e: electricityKgCo2e,
      waste_kg_co2e: wasteKgCo2e,
      total_kg_co2e: round2(electricityKgCo2e + wasteKgCo2e),
    };
  });
}

/**
 * Resumen ejecutivo institucional (para el dashboard "Huella de Carbono de TdeA", visible a
 * cualquier usuario). Combina dos fuentes de datos de alcance distinto — decisión explícita
 * del usuario, declarada aquí:
 *
 * - Energía y Residuos: eventos reales por zona (consumption_records / waste_records),
 *   agregables por rango de fechas porque son mediciones puntuales en el tiempo.
 * - Transporte: NO existe una fuente institucional de transporte por zona (HU-06/07 no la
 *   capturan). Se usa como proxy la suma del transporte reportado en la ÚLTIMA respuesta del
 *   cuestionario individual (HU-04) de cada usuario — un supuesto de alcance mixto (comportamiento
 *   individual anualizado, no una medición institucional), que debe declararse en el informe
 *   técnico. Por ser una fotografía del estado actual (no un evento con fecha), NO se filtra por
 *   rango de fechas ni participa en la comparación año a año.
 */
export async function getInstitutionalSummary(): Promise<InstitutionalSummary> {
  const now = new Date();
  const currentFrom = toIsoDate(monthsAgo(now, 12));
  const currentTo = toIsoDate(now);
  const previousFrom = toIsoDate(monthsAgo(now, 24));
  const previousTo = currentFrom;

  const [currentTotals, previousTotals, monthlyRows, zoneTotals, latestResponses, registeredUsers, zonesMonitored] =
    await Promise.all([
      reportsRepository.getAggregateTotals(currentFrom, currentTo),
      reportsRepository.getAggregateTotals(previousFrom, previousTo),
      reportsRepository.getMonthlyInstitutionalTotals(currentFrom, currentTo),
      reportsRepository.getZoneTotals(currentFrom, currentTo),
      getLatestResponsePerUser(),
      reportsRepository.getRegisteredUsersCount(),
      reportsRepository.getZoneCount(),
    ]);

  const transportKgCo2e = round2(
    latestResponses.reduce((sum, r) => sum + Number(r.transport_kg_co2e), 0),
  );

  const currentEnergyWasteKgCo2e = institutionalKgCo2e(
    Number(currentTotals.total_kwh),
    Number(currentTotals.total_waste_kg),
  );
  const previousEnergyWasteKgCo2e = institutionalKgCo2e(
    Number(previousTotals.total_kwh),
    Number(previousTotals.total_waste_kg),
  );

  const totalKgCo2e = round2(currentEnergyWasteKgCo2e + transportKgCo2e);

  // La comparación año a año solo cubre Energía+Residuos (lo único con historial real por fecha).
  const hasPreviousYearData = Number(previousTotals.total_kwh) > 0 || Number(previousTotals.total_waste_kg) > 0;
  const yearOverYearPct = hasPreviousYearData
    ? Math.round(
        ((currentEnergyWasteKgCo2e - previousEnergyWasteKgCo2e) / previousEnergyWasteKgCo2e) * 100,
      )
    : null;

  const monthly = monthlyRows.map((row) => ({
    month: row.month,
    kg_co2e: round2(institutionalKgCo2e(Number(row.total_kwh), Number(row.total_waste_kg))),
  }));

  const topZones = zoneTotals
    .map((zone) => ({
      zone_name: zone.zone_name,
      kg_co2e: round2(institutionalKgCo2e(Number(zone.total_kwh), Number(zone.total_waste_kg))),
    }))
    .sort((a, b) => b.kg_co2e - a.kg_co2e)
    .slice(0, 5);

  const insight =
    topZones.length > 0 && topZones[0].kg_co2e > 0
      ? `La mayor emisión proviene de ${topZones[0].zone_name}, con ${(topZones[0].kg_co2e / 1000).toFixed(2)} tCO2e en los últimos 12 meses.`
      : null;

  return {
    totalKgCo2e,
    yearOverYearPct,
    totalKwh: round2(Number(currentTotals.total_kwh)),
    totalWasteKg: round2(Number(currentTotals.total_waste_kg)),
    transportKgCo2e,
    averagePerPersonKgCo2e: registeredUsers > 0 ? round2(totalKgCo2e / registeredUsers) : 0,
    registeredUsers,
    zonesMonitored,
    monthly,
    distribution: {
      transporte: transportKgCo2e,
      energia: round2(Number(currentTotals.total_kwh) * ELECTRICITY_KG_CO2E_PER_KWH),
      residuos: round2(Number(currentTotals.total_waste_kg) * WASTE_KG_CO2E_PER_KG),
    },
    topZones,
    insight,
  };
}
