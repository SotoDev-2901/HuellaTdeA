import { formatEmission, pickEmissionUnit } from '../../lib/format';
import type { TopZone } from '../../services/reportsService';

interface ZoneRankingListProps {
  zones: TopZone[];
}

export function ZoneRankingList({ zones }: ZoneRankingListProps) {
  if (zones.length === 0) {
    return <p className="py-6 text-center text-sm text-graphite">Todavía no hay datos por zona.</p>;
  }

  const rankUnit = pickEmissionUnit(...zones.map((z) => z.kg_co2e));

  return (
    <ol className="flex flex-col gap-3">
      {zones.map((zone, i) => (
        <li key={zone.zone_name} className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i === 0 ? 'bg-tdea-green text-white' : 'bg-tdea-blush text-graphite'
            }`}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{zone.zone_name}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-tdea-green">
            {formatEmission(zone.kg_co2e, rankUnit)}
          </p>
        </li>
      ))}
    </ol>
  );
}
