import { useState } from 'react';
import type { MonthlyFootprintPoint } from '../../services/dashboardService';

interface MonthlyTrendChartProps {
  points: MonthlyFootprintPoint[];
  emptyMessage?: string;
  singlePointMessage?: string;
  /** Unidad mostrada en el tooltip al pasar el mouse (ej. "kgCO2e"). */
  unit?: string;
  /** Formatea el valor del tooltip (p. ej. para elegir kg o toneladas). Tiene prioridad sobre `unit`. */
  formatValue?: (value: number) => string;
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

export function MonthlyTrendChart({
  points,
  emptyMessage = 'Todavía no hay suficientes datos para mostrar una tendencia.',
  singlePointMessage = 'Se necesita más de un mes de datos para ver la evolución en el tiempo.',
  unit = 'kgCO2e',
  formatValue,
}: MonthlyTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-graphite">{emptyMessage}</p>;
  }

  if (points.length === 1) {
    return <p className="py-8 text-center text-sm text-graphite">{singlePointMessage}</p>;
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
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="relative">
      <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="Evolución mensual de tu huella"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <path d={areaPath} fill="var(--color-tdea-green)" opacity={0.12} />
        <path d={linePath} fill="none" stroke="var(--color-tdea-green)" strokeWidth={2.5} />

        {hovered ? (
          <line
            x1={hovered.x}
            y1={PADDING / 2}
            x2={hovered.x}
            y2={HEIGHT - PADDING}
            stroke="var(--color-tdea-blush-border)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ) : null}

        {coords.map((c, i) => (
          <g key={c.point.month}>
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIndex === i ? 6 : 3.5}
              fill="var(--color-tdea-green)"
              className="transition-all duration-150"
            />
            <text x={c.x} y={HEIGHT - 6} textAnchor="middle" className="fill-silver text-[10px]">
              {MONTH_LABELS[c.point.month.slice(5, 7)] ?? c.point.month.slice(5, 7)}
            </text>
            {/* Área invisible más grande para facilitar el hover sobre el punto */}
            <circle
              cx={c.x}
              cy={c.y}
              r={12}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            />
          </g>
        ))}
      </svg>
      </div>

      {hovered ? (
        <div
          className="print-hide pointer-events-none absolute z-10 rounded-input bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-white shadow-soft"
          style={{
            left: hovered.x,
            top: hovered.y + 14,
            // Cerca de los bordes izquierdo/derecho, no centrar el tooltip en el punto —
            // así nunca se sale del contenedor ni se recorta.
            transform:
              hovered.x < 50 ? 'translateX(0)' : hovered.x > WIDTH - 50 ? 'translateX(-100%)' : 'translateX(-50%)',
          }}
        >
          <p className="font-semibold">
            {MONTH_LABELS[hovered.point.month.slice(5, 7)] ?? hovered.point.month}
          </p>
          <p>
            {formatValue
              ? formatValue(hovered.point.total_kg_co2e)
              : `${hovered.point.total_kg_co2e.toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${unit}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
