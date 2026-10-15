export interface PersonalFootprintBreakdown {
  transporte_kg_co2e: number;
  energia_kg_co2e: number;
  residuos_kg_co2e: number;
  total_kg_co2e: number;
}

export interface MonthlyFootprintPoint {
  month: string; // 'YYYY-MM'
  total_kg_co2e: number;
}

export interface PersonalDashboard {
  hasResponses: boolean;
  latest: PersonalFootprintBreakdown | null;
  previousTotalKgCo2e: number | null;
  monthly: MonthlyFootprintPoint[];
  tdeaAverageKgCo2e: number;
}
