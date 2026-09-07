import { Button } from '../atoms/Button';
import type { QuestionnaireResponse } from '../../services/questionnaireService';

interface QuestionnaireResultProps {
  result: QuestionnaireResponse;
  onRestart: () => void;
}

function Row({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-graphite">{label}</span>
        <span className="font-medium text-ink">{value.toFixed(2)} kgCO2e</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-pill bg-tdea-blush-border">
        <div className="h-1.5 rounded-pill bg-tdea-green" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function QuestionnaireResult({ result, onRestart }: QuestionnaireResultProps) {
  const breakdown = {
    transporte: Number(result.transport_kg_co2e),
    dispositivos: Number(result.devices_kg_co2e),
    residuos: Number(result.waste_kg_co2e),
    alimentacion: Number(result.diet_kg_co2e),
  };
  const max = Math.max(...Object.values(breakdown));

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tdea-green/10 text-3xl">
          ✅
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-ink">¡Respuestas completadas!</h2>
        <p className="mt-1 text-sm text-graphite">
          Tu huella de carbono anual estimada es de{' '}
          <span className="font-bold text-tdea-green">{result.total_kg_co2e} kgCO2e</span>
        </p>
      </div>

      <div className="rounded-input bg-tdea-blush p-4">
        <Row label="Transporte" value={breakdown.transporte} max={max} />
        <Row label="Dispositivos" value={breakdown.dispositivos} max={max} />
        <Row label="Residuos" value={breakdown.residuos} max={max} />
        <Row label="Alimentación" value={breakdown.alimentacion} max={max} />
      </div>

      <Button type="button" onClick={onRestart}>
        Responder de nuevo
      </Button>
    </div>
  );
}
