import { apiGet, apiPost } from '../lib/api';

export type Lever = Record<string, unknown> & { tipo: string };

export interface Breakdown {
  transporte: number;
  energia: number;
  residuos: number;
  total: number;
}

export interface SimulationResult {
  base: Breakdown;
  scenario: Breakdown;
  delta: Breakdown;
  deltaPct: { transporte: number | null; energia: number | null; residuos: number | null; total: number | null };
  levers: string[];
  assumptions: string[];
}

export interface SimulationExample {
  label: string;
  levers: Lever[];
}

export interface SimulationOptions {
  zones: string[];
  examples: SimulationExample[];
  aiEnabled: boolean;
}

export interface AskResponse {
  understood: boolean;
  interpretation?: string;
  reason?: string;
  levers?: Lever[];
  result?: SimulationResult;
  summary?: string;
}

export function getOptions(): Promise<SimulationOptions> {
  return apiGet<SimulationOptions>('/simulations/options');
}

export function runScenario(levers: Lever[]): Promise<{ result: SimulationResult; summary: string }> {
  return apiPost('/simulations/run', { levers });
}

export function ask(question: string): Promise<AskResponse> {
  return apiPost<AskResponse>('/simulations/ask', { question });
}
