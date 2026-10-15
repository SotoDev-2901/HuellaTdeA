import { emissionUnitLabel, formatEmissionNumber, pickEmissionUnit } from '../../lib/format';

interface TdeaComparisonBarProps {
  personalKgCo2e: number;
  averageKgCo2e: number;
}

export function TdeaComparisonBar({ personalKgCo2e, averageKgCo2e }: TdeaComparisonBarProps) {
  const unit = pickEmissionUnit(personalKgCo2e, averageKgCo2e);
  const unitLabel = emissionUnitLabel(unit);
  const max = Math.max(personalKgCo2e, averageKgCo2e, 1);
  const personalPct = (personalKgCo2e / max) * 100;
  const averagePct = (averageKgCo2e / max) * 100;

  const diffPct =
    averageKgCo2e > 0 ? Math.round(((averageKgCo2e - personalKgCo2e) / averageKgCo2e) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-tdea-green" /> Tú ({formatEmissionNumber(personalKgCo2e, unit)} {unitLabel})
          </span>
          <span className="flex items-center gap-1.5 text-graphite">
            <span className="h-2.5 w-2.5 rounded-full bg-silver" /> Promedio TdeA (
            {formatEmissionNumber(averageKgCo2e, unit)} {unitLabel})
          </span>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-pill bg-tdea-blush-border">
        <div
          className="h-full rounded-pill bg-tdea-green transition-all"
          style={{ width: `${Math.min(personalPct, 100)}%` }}
        />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-pill bg-tdea-blush">
        <div
          className="h-full rounded-pill bg-silver"
          style={{ width: `${Math.min(averagePct, 100)}%` }}
        />
      </div>

      {averageKgCo2e > 0 ? (
        <p
          className={`rounded-input px-3 py-2 text-sm font-medium ${
            diffPct >= 0 ? 'bg-tdea-green/10 text-tdea-green' : 'bg-danger-bg text-danger'
          }`}
        >
          {diffPct >= 0
            ? `Ahorras un ${diffPct}% respecto a la media`
            : `Estás un ${Math.abs(diffPct)}% por encima de la media`}
        </p>
      ) : null}
    </div>
  );
}
