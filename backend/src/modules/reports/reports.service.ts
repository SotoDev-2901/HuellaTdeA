import {
  ELECTRICITY_KG_CO2E_PER_KWH,
  WASTE_KG_CO2E_PER_KG,
} from '../footprint/emissionFactors.js';
import * as reportsRepository from './reports.repository.js';
import type { ZoneFootprintSummary } from './reports.types.js';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
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
