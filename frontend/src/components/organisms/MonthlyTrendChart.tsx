import type { MonthlyFootprintPoint } from '../../services/dashboardService';

interface MonthlyTrendChartProps {
  points: MonthlyFootprintPoint[];
}

const WIDTH = 420;
const HEIGHT = 160;
const PADDING = 24;

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
};

export function MonthlyTrendChart({ points }: MonthlyTrendChartProps) {
  if (points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-graphite">
        Todavía no hay suficientes respuestas para mostrar una tendencia.
      </p>
    );
  }

  if (points.length === 1) {
    return (
      <p className="py-8 text-center text-sm text-graphite">
        Responde el cuestionario en más de un mes para ver tu evolución en el tiempo.
      </p>
    );
  }

  const maxValue = Math.max(...points.map((p) => p.total_kg_co2e), 1);
  const stepX = (WIDTH - PADDING * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = PADDING + i * stepX;
    const y = HEIGHT - PADDING - (p.total_kg_co2e / maxValue) * (HEIGHT - PADDING * 2);
    return { x, y, point: p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${HEIGHT - PADDING} L ${coords[0].x} ${HEIGHT - PADDING} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img" aria-label="Evolución mensual de tu huella">
        <path d={areaPath} fill="var(--color-tdea-green)" opacity={0.12} />
        <path d={linePath} fill="none" stroke="var(--color-tdea-green)" strokeWidth={2.5} />
        {coords.map((c) => (
          <g key={c.point.month}>
            <circle cx={c.x} cy={c.y} r={3.5} fill="var(--color-tdea-green)" />
            <text x={c.x} y={HEIGHT - 6} textAnchor="middle" className="fill-silver text-[10px]">
              {MONTH_LABELS[c.point.month.slice(5, 7)] ?? c.point.month.slice(5, 7)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
