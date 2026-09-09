export interface ZoneFootprintSummary {
  zone_id: string;
  zone_name: string;
  total_kwh: number;
  total_waste_kg: number;
  electricity_kg_co2e: number;
  waste_kg_co2e: number;
  total_kg_co2e: number;
}
