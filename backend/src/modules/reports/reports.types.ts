export interface ZoneFootprintSummary {
  zone_id: string;
  zone_name: string;
  total_kwh: number;
  total_waste_kg: number;
  electricity_kg_co2e: number;
  waste_kg_co2e: number;
  total_kg_co2e: number;
}

export interface MonthlyInstitutionalPoint {
  month: string;
  kg_co2e: number;
}

export interface TopZone {
  zone_name: string;
  kg_co2e: number;
}

export interface InstitutionalSummary {
  totalKgCo2e: number;
  yearOverYearPct: number | null;
  totalKwh: number;
  totalWasteKg: number;
  transportKgCo2e: number;
  averagePerPersonKgCo2e: number;
  registeredUsers: number;
  zonesMonitored: number;
  monthly: MonthlyInstitutionalPoint[];
  distribution: { transporte: number; energia: number; residuos: number };
  topZones: TopZone[];
  insight: string | null;
}
