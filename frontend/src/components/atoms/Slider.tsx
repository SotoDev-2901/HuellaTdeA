interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}

export function Slider({ label, min, max, value, minLabel, maxLabel, onChange }: SliderProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-graphite">{label}</label>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-input bg-tdea-green px-2 text-sm font-bold text-white">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-tdea-green)]"
      />
      <div className="mt-1 flex justify-between text-xs text-silver">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
