import * as dashboardRepository from './dashboard.repository.js';
import type { RawFootprintRow } from './dashboard.repository.js';
import type { MonthlyFootprintPoint, PersonalDashboard, PersonalFootprintBreakdown } from './dashboard.types.js';

const MONTHS_OF_HISTORY = 12;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * El dashboard personal solo muestra 3 categorías (Transporte, Energía, Residuos) — la
 * Alimentación no se incluye en esta vista por decisión explícita del usuario, aunque sigue
 * calculándose y guardándose para Historial/HU-05. "Energía" agrupa Instalaciones + Dispositivos
 * porque ambas son electricidad consumida en el campus (mismo factor UPME).
 */
function toBreakdown(row: RawFootprintRow): PersonalFootprintBreakdown {
  const transporte = Number(row.transport_kg_co2e);
  const energia = Number(row.facilities_kg_co2e) + Number(row.devices_kg_co2e);
  const residuos = Number(row.waste_kg_co2e);
  return {
    transporte_kg_co2e: round2(transporte),
    energia_kg_co2e: round2(energia),
    residuos_kg_co2e: round2(residuos),
    total_kg_co2e: round2(transporte + energia + residuos),
  };
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getPersonalDashboard(userId: string): Promise<PersonalDashboard> {
  const [responses, latestPerUser] = await Promise.all([
    dashboardRepository.getResponsesForUser(userId),
    dashboardRepository.getLatestResponsePerUser(),
  ]);

  const tdeaAverageKgCo2e =
    latestPerUser.length > 0
      ? round2(
          latestPerUser.reduce((sum, row) => sum + toBreakdown(row).total_kg_co2e, 0) /
            latestPerUser.length,
        )
      : 0;

  if (responses.length === 0) {
    return { hasResponses: false, latest: null, previousTotalKgCo2e: null, monthly: [], tdeaAverageKgCo2e };
  }

  const latest = toBreakdown(responses[responses.length - 1]);
  const previousTotalKgCo2e =
    responses.length > 1 ? toBreakdown(responses[responses.length - 2]).total_kg_co2e : null;

  const monthlyMap = new Map<string, number>();
  for (const row of responses) {
    const key = monthKey(new Date(row.created_at));
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + toBreakdown(row).total_kg_co2e);
  }
  const monthly: MonthlyFootprintPoint[] = Array.from(monthlyMap.entries())
    .map(([month, total]) => ({ month, total_kg_co2e: round2(total) }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-MONTHS_OF_HISTORY);

  return { hasResponses: true, latest, previousTotalKgCo2e, monthly, tdeaAverageKgCo2e };
}
