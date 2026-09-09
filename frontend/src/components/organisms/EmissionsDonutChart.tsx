interface Segment {
  label: string;
  value: number;
  colorVar: string;
}

interface EmissionsDonutChartProps {
  segments: Segment[];
  totalLabel: string;
}

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function EmissionsDonutChart({ segments, totalLabel }: EmissionsDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-tdea-blush-border)"
          strokeWidth={STROKE}
        />
        {total > 0
          ? segments.map((segment) => {
              const fraction = segment.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={segment.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.colorVar}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              );
              offset += dash;
              return circle;
            })
          : null}
        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          className="fill-silver text-[9px] font-semibold uppercase tracking-wide"
        >
          Total
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 14} textAnchor="middle" className="fill-ink text-base font-bold">
          {totalLabel}
        </text>
      </svg>

      <div className="flex flex-col gap-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.colorVar }} />
            <span className="text-graphite">{segment.label}</span>
            <span className="font-semibold text-ink">
              {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
