import { emissionUnitLabel, formatEmissionNumber, pickEmissionUnit } from '../../lib/format';
import type { SimulationResult } from '../../services/simulationService';

const CATEGORIES = [
  { key: 'transporte', label: 'Transporte' },
  { key: 'energia', label: 'Energía' },
  { key: 'residuos', label: 'Residuos' },
] as const;

interface ScenarioResultProps {
  result: SimulationResult;
  summary: string;
  interpretation?: string;
}

function pctLabel(pct: number | null): string {
  if (pct === null) return '';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
}

export function ScenarioResult({ result, summary, interpretation }: ScenarioResultProps) {
  const unit = pickEmissionUnit(result.base.total, result.scenario.total);
  const unitLabel = emissionUnitLabel(unit);
  const max = Math.max(result.base.total, result.scenario.total, 1);
  const improved = result.delta.total < 0;

  return (
    <div className="flex flex-col gap-4">
      {interpretation ? (
        <p className="rounded-input bg-tdea-blush px-3 py-2 text-sm text-graphite">
          <span className="font-semibold text-ink">Entendí: </span>
          {interpretation}
        </p>
      ) : null}

      <div
        className={`rounded-card p-5 text-white shadow-soft ${
          result.delta.total === 0 ? 'bg-silver' : improved ? 'bg-tdea-green' : 'bg-danger'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Huella institucional</p>
        <p className="mt-1 text-3xl font-bold">
          {formatEmissionNumber(result.scenario.total, unit)} <span className="text-base font-medium">{unitLabel}</span>
          {result.deltaPct.total !== null ? (
            <span className="ml-3 rounded-pill bg-white/20 px-2.5 py-0.5 align-middle text-sm font-semibold">
              {pctLabel(result.deltaPct.total)}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-sm text-white/90">{summary}</p>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-soft">
        <h3 className="font-display text-base font-bold text-ink">Antes y después</h3>
        <div className="mt-3 flex flex-col gap-4">
          {CATEGORIES.map(({ key, label }) => {
            const base = result.base[key];
            const scenario = result.scenario[key];
            const delta = result.delta[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{label}</span>
                  <span className={delta < 0 ? 'text-tdea-green' : delta > 0 ? 'text-danger' : 'text-silver'}>
                    {delta === 0 ? 'Sin cambio' : `${pctLabel(result.deltaPct[key])} · ${formatEmissionNumber(delta, unit)} ${unitLabel}`}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[11px] text-silver">Actual</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-tdea-blush">
                      <div className="h-full rounded-pill bg-silver transition-all" style={{ width: `${(base / max) * 100}%` }} />
                    </div>
                    <span className="w-20 text-right text-xs text-graphite">{formatEmissionNumber(base, unit)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[11px] text-silver">Escenario</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-tdea-blush">
                      <div className="h-full rounded-pill bg-tdea-green transition-all" style={{ width: `${(scenario / max) * 100}%` }} />
                    </div>
                    <span className="w-20 text-right text-xs font-semibold text-ink">{formatEmissionNumber(scenario, unit)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-silver">Valores en {unitLabel}, estimación de los últimos 12 meses.</p>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-soft">
        <h3 className="font-display text-base font-bold text-ink">Qué se simuló</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-graphite">
          {result.levers.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-base font-bold text-ink">Supuestos</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-silver">
          {result.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
