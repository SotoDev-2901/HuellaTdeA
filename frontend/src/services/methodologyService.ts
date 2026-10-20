import { apiGet } from '../lib/api';

export interface MethodologyFactor {
  key: string;
  value: string;
  source: string;
  kind: 'official' | 'assumption';
}

export interface MethodologyCategory {
  id: string;
  label: string;
  formula: string;
  factors: MethodologyFactor[];
}

export interface Methodology {
  weeksPerYear: number;
  categories: MethodologyCategory[];
}

export function getMethodology(): Promise<Methodology> {
  return apiGet<Methodology>('/footprint/methodology');
}
