import type { ZoneFootprintSummary } from '../../services/reportsService';

interface ZoneFootprintChartProps {
  zones: ZoneFootprintSummary[];
}

const CHART_HEIGHT = 220;
const BAR_WIDTH = 56;
const BAR_GAP = 24;
const LABEL_HEIGHT = 40;

export function ZoneFootprintChart({ zones }: ZoneFootprintChartProps) {
  if (zones.length === 0) {
    return null;
  }

  const maxValue = Math.max(...zones.map((z) => z.total_kg_co2e), 1);
  const width = zones.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;
  const height = CHART_HEIGHT + LABEL_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(width, 320)} ${height}`}
        width={Math.max(width, 320)}
        height={height}
        role="img"
        aria-label="Huella de carbono institucional por zona"
      >
        {zones.map((zone, i) => {
          const barHeight = (zone.total_kg_co2e / maxValue) * (CHART_HEIGHT - 30);
          const x = BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;

          return (
            <g key={zone.zone_id}>
              <text
                x={x + BAR_WIDTH / 2}
                y={y - 8}
                textAnchor="middle"
                className="fill-graphite text-[11px] font-semibold"
              >
                {zone.total_kg_co2e.toFixed(0)}
              </text>
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={Math.max(barHeight, 1)}
                rx={6}
                className="fill-tdea-green"
              />
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 20}
                textAnchor="middle"
                className="fill-graphite text-[11px]"
              >
                {zone.zone_name.length > 12 ? `${zone.zone_name.slice(0, 11)}…` : zone.zone_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
