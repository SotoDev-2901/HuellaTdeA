import {
  ELECTRICITY_KG_CO2E_PER_KWH,
  WASTE_KG_CO2E_PER_KG,
  calculateTransportEmissions,
  type TransportMode,
} from '../footprint/emissionFactors.js';
import type { Lever } from './simulation.schema.js';

export interface BaselinePerson {
  mode: TransportMode;
  km: number;
  days: number;
}

export interface BaselineZone {
  name: string;
  kwh: number;
  waste: { plastico: number; papel: number; organico: number };
}

export interface Baseline {
  people: BaselinePerson[];
  zones: BaselineZone[];
}

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

export class SimulationInputError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/** Encuentra una zona por nombre exacto (sin tildes ni mayúsculas) o, si es único, por coincidencia parcial. */
function matchZones(zones: BaselineZone[], wanted: string | null | undefined): BaselineZone[] {
  if (!wanted) return zones;
  const target = normalize(wanted);
  const exact = zones.filter((z) => normalize(z.name) === target);
  if (exact.length > 0) return exact;
  const partial = zones.filter((z) => normalize(z.name).includes(target) || target.includes(normalize(z.name)));
  if (partial.length === 1) return partial;
  throw new SimulationInputError(
    partial.length > 1
      ? `"${wanted}" coincide con varias zonas; indica el nombre completo.`
      : `No encontré la zona "${wanted}". Zonas disponibles: ${zones.map((z) => z.name).join(', ')}.`,
  );
}

const MODE_LABEL: Record<string, string> = {
  carro: 'carro',
  moto: 'moto',
  transporte_publico: 'transporte público',
  bicicleta: 'bicicleta',
  caminar: 'caminar',
};
const WASTE_LABEL = { plastico: 'plástico', papel: 'papel', organico: 'orgánico' } as const;

interface WeightedState {
  weight: number;
  mode: TransportMode;
  days: number;
}

/**
 * Motor determinista del simulador. Usa los MISMOS factores y fórmulas que el cálculo real:
 * transporte con `calculateTransportEmissions` sobre la última respuesta de cada persona, y
 * energía/residuos con kWh × factor eléctrico y kg × factor de residuos (como el dashboard
 * institucional). Un porcentaje de personas que cambia de hábito se modela como valor esperado
 * (pesos fraccionarios), no con azar: la misma pregunta da siempre el mismo resultado.
 */
export function simulate(baseline: Baseline, levers: Lever[]): SimulationResult {
  // ---- transporte: cada persona es una distribución de estados (modo, días) con pesos ----
  const states: WeightedState[][] = baseline.people.map((p) => [{ weight: 1, mode: p.mode, days: p.days }]);
  const descriptions: string[] = [];
  const assumptions = new Set<string>([
    'El transporte institucional se estima con la última respuesta del cuestionario de cada persona.',
  ]);

  // ---- energía y residuos: se parte de los totales por zona y se escalan ----
  const zones = baseline.zones.map((z) => ({ ...z, waste: { ...z.waste }, kwhFactor: 1, wasteFactor: { plastico: 1, papel: 1, organico: 1 } }));

  for (const lever of levers) {
    if (lever.tipo === 'cambio_transporte') {
      if (lever.desde === lever.hacia) throw new SimulationInputError('El medio de origen y el de destino deben ser distintos.');
      const p = lever.porcentaje / 100;
      states.forEach((person) => {
        const next: WeightedState[] = [];
        for (const s of person) {
          if (s.mode === lever.desde) {
            next.push({ ...s, weight: s.weight * (1 - p) });
            next.push({ ...s, weight: s.weight * p, mode: lever.hacia as TransportMode });
          } else next.push(s);
        }
        person.splice(0, person.length, ...next);
      });
      descriptions.push(`${lever.porcentaje} % de quienes usan ${MODE_LABEL[lever.desde]} pasan a ${MODE_LABEL[lever.hacia]}`);
    } else if (lever.tipo === 'reduccion_dias') {
      const p = lever.porcentajePersonas / 100;
      states.forEach((person) => {
        const next: WeightedState[] = [];
        for (const s of person) {
          const newDays = Math.max(1, s.days - lever.diasMenos);
          next.push({ ...s, weight: s.weight * (1 - p) });
          next.push({ ...s, weight: s.weight * p, days: newDays });
        }
        person.splice(0, person.length, ...next);
      });
      descriptions.push(`${lever.porcentajePersonas} % de las personas viene ${lever.diasMenos} ${lever.diasMenos === 1 ? 'día' : 'días'} menos por semana`);
      assumptions.add('Menos días de asistencia reduce solo el transporte; el consumo eléctrico y los residuos de los edificios se mantienen.');
    } else if (lever.tipo === 'eficiencia_energetica') {
      const targets = matchZones(baseline.zones, lever.zona);
      zones.forEach((z) => {
        if (targets.some((t) => t.name === z.name)) z.kwhFactor *= 1 - lever.porcentaje / 100;
      });
      descriptions.push(`${lever.porcentaje} % menos de consumo eléctrico ${lever.zona ? `en ${targets[0].name}` : 'en todo el campus'}`);
    } else if (lever.tipo === 'reduccion_residuos') {
      const targets = matchZones(baseline.zones, lever.zona);
      const types = lever.tipoResiduo ? [lever.tipoResiduo] : (['plastico', 'papel', 'organico'] as const);
      zones.forEach((z) => {
        if (!targets.some((t) => t.name === z.name)) return;
        for (const t of types) z.wasteFactor[t] *= 1 - lever.porcentaje / 100;
      });
      descriptions.push(
        `${lever.porcentaje} % menos de residuos${lever.tipoResiduo ? ` de ${WASTE_LABEL[lever.tipoResiduo]}` : ''} ${lever.zona ? `en ${targets[0].name}` : 'en todo el campus'}`,
      );
    }
  }

  const personEmission = (person: BaselinePerson, list: WeightedState[]) =>
    list.reduce((sum, s) => sum + s.weight * calculateTransportEmissions(s.mode, person.km, s.days), 0);

  const baseTransport = baseline.people.reduce((sum, p) => sum + calculateTransportEmissions(p.mode, p.km, p.days), 0);
  const scenarioTransport = baseline.people.reduce((sum, p, i) => sum + personEmission(p, states[i]), 0);

  const baseEnergy = zones.reduce((s, z) => s + z.kwh * ELECTRICITY_KG_CO2E_PER_KWH, 0);
  const scenarioEnergy = zones.reduce((s, z) => s + z.kwh * z.kwhFactor * ELECTRICITY_KG_CO2E_PER_KWH, 0);
  const baseWaste = zones.reduce((s, z) => s + (z.waste.plastico + z.waste.papel + z.waste.organico) * WASTE_KG_CO2E_PER_KG, 0);
  const scenarioWaste = zones.reduce(
    (s, z) =>
      s +
      (z.waste.plastico * z.wasteFactor.plastico + z.waste.papel * z.wasteFactor.papel + z.waste.organico * z.wasteFactor.organico) *
        WASTE_KG_CO2E_PER_KG,
    0,
  );

  const mk = (t: number, e: number, w: number): Breakdown => ({
    transporte: round2(t),
    energia: round2(e),
    residuos: round2(w),
    total: round2(t + e + w),
  });
  const base = mk(baseTransport, baseEnergy, baseWaste);
  const scenario = mk(scenarioTransport, scenarioEnergy, scenarioWaste);
  const delta = mk(scenarioTransport - baseTransport, scenarioEnergy - baseEnergy, scenarioWaste - baseWaste);
  const pctOf = (d: number, b: number) => (b > 0 ? Math.round((d / b) * 1000) / 10 : null);

  return {
    base,
    scenario,
    delta,
    deltaPct: {
      transporte: pctOf(delta.transporte, base.transporte),
      energia: pctOf(delta.energia, base.energia),
      residuos: pctOf(delta.residuos, base.residuos),
      total: pctOf(delta.total, base.total),
    },
    levers: descriptions,
    assumptions: [...assumptions, 'Es una estimación con los factores y supuestos del sistema; no es una predicción.'],
  };
}
