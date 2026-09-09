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
