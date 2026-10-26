import { useRef, useState } from 'react';

interface Segment {
  label: string;
  value: number;
  colorVar: string;
}

interface EmissionsDonutChartProps {
  segments: Segment[];
  totalLabel: string;
  /** Unidad mostrada en el tooltip al pasar el mouse (ej. "kgCO2e", "kg"). */
  unit?: string;
  /** Formatea el valor del tooltip (p. ej. para elegir kg o toneladas). Tiene prioridad sobre `unit`. */
  formatValue?: (value: number) => string;
  /** Unidad pequeña bajo el total del centro. */
  totalUnit?: string;
}

interface HoverState {
  index: number;
  x: number;
  y: number;
}

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function EmissionsDonutChart({ segments, totalLabel, unit = 'kg', formatValue, totalUnit }: EmissionsDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  let offset = 0;

  function handleEnter(index: number) {
    return (event: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover({ index, x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
  }

  function handleMove(index: number) {
    return (event: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover({ index, x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
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
          ? segments.map((segment, index) => {
              const fraction = segment.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const isHovered = hover?.index === index;
              const isDimmed = hover !== null && !isHovered;
              const circle = (
                <circle
                  key={segment.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.colorVar}
                  strokeWidth={isHovered ? STROKE + 4 : STROKE}
                  strokeOpacity={isDimmed ? 0.35 : 1}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={handleEnter(index)}
                  onMouseMove={handleMove(index)}
                  onMouseLeave={() => setHover(null)}
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
          {hover !== null ? segments[hover.index].label : 'Total'}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 14} textAnchor="middle" className="fill-ink text-base font-bold">
          {hover !== null
            ? `${total > 0 ? Math.round((segments[hover.index].value / total) * 100) : 0}%`
            : totalLabel}
        </text>
        {hover === null && totalUnit ? (
          <text x={SIZE / 2} y={SIZE / 2 + 28} textAnchor="middle" className="fill-silver text-[8px] font-semibold">
            {totalUnit}
          </text>
        ) : null}
      </svg>

      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            onMouseEnter={handleEnter(index)}
            onMouseMove={handleMove(index)}
            onMouseLeave={() => setHover(null)}
            className={`flex cursor-pointer items-center gap-2 rounded-input px-1.5 py-1 text-sm transition-colors ${
              hover?.index === index ? 'bg-tdea-blush' : ''
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.colorVar }} />
            <span className="text-graphite">{segment.label}</span>
            <span className="font-semibold text-ink">
              {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>

      {hover !== null ? (
        <div
          className="print-hide pointer-events-none absolute z-10 -translate-x-1/2 rounded-input bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-white shadow-soft"
          style={{ left: hover.x, top: hover.y + 14 }}
        >
          <p className="font-semibold">{segments[hover.index].label}</p>
          <p>
            {formatValue
              ? formatValue(segments[hover.index].value)
              : `${segments[hover.index].value.toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${unit}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
