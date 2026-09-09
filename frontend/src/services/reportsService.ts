import { apiGet } from '../lib/api';

export interface ZoneFootprintSummary {
  zone_id: string;
  zone_name: string;
  total_kwh: number;
  total_waste_kg: number;
  electricity_kg_co2e: number;
  waste_kg_co2e: number;
  total_kg_co2e: number;
}

export interface InstitutionalReportFilters {
  from?: string;
  to?: string;
}

export async function getInstitutionalReport(
  filters: InstitutionalReportFilters = {},
): Promise<ZoneFootprintSummary[]> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const query = params.toString();

  const res = await apiGet<{ zones: ZoneFootprintSummary[] }>(
    `/reports/institutional${query ? `?${query}` : ''}`,
  );
  return res.zones;
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

export async function getInstitutionalSummary(): Promise<InstitutionalSummary> {
  return apiGet<InstitutionalSummary>('/reports/institutional-summary');
}
