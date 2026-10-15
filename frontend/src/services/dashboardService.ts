import { apiGet } from '../lib/api';

export interface PersonalFootprintBreakdown {
  transporte_kg_co2e: number;
  energia_kg_co2e: number;
  residuos_kg_co2e: number;
  total_kg_co2e: number;
}

export interface MonthlyFootprintPoint {
  month: string;
  total_kg_co2e: number;
}

export interface PersonalDashboard {
  hasResponses: boolean;
  latest: PersonalFootprintBreakdown | null;
  previousTotalKgCo2e: number | null;
  monthly: MonthlyFootprintPoint[];
  tdeaAverageKgCo2e: number;
}

export async function getPersonalDashboard(): Promise<PersonalDashboard> {
  return apiGet<PersonalDashboard>('/questionnaire/dashboard');
}

export interface Recommendation {
  category: 'transporte' | 'energia' | 'residuos';
  title: string;
  description: string;
}

export interface RecommendationsResult {
  hasResponses: boolean;
  source: 'ai' | 'rules';
  items: Recommendation[];
}

export async function getRecommendations(): Promise<RecommendationsResult> {
  return apiGet<RecommendationsResult>('/questionnaire/recommendations');
}
