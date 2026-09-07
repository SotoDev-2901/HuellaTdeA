import { Button } from '../atoms/Button';
import type { QuestionnaireResponse } from '../../services/questionnaireService';

interface QuestionnaireResultProps {
  result: QuestionnaireResponse;
  onRestart: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-tdea-blush-border/60 py-2 text-sm">
      <span className="text-graphite">{label}</span>
      <span className="font-medium text-ink">{value} kgCO2e</span>
    </div>
  );
}

export function QuestionnaireResult({ result, onRestart }: QuestionnaireResultProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tdea-green/10 text-2xl">
          ✅
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-ink">¡Respuestas completadas!</h2>
        <p className="mt-1 text-sm text-graphite">
          Tu huella de carbono anual estimada es de{' '}
          <span className="font-bold text-tdea-green">{result.total_kg_co2e} kgCO2e</span>
        </p>
      </div>

      <div className="rounded-input bg-tdea-blush p-4">
        <Row label="Transporte" value={result.transport_kg_co2e} />
        <Row label="Dispositivos" value={result.devices_kg_co2e} />
        <Row label="Residuos" value={result.waste_kg_co2e} />
        <Row label="Alimentación" value={result.diet_kg_co2e} />
      </div>

      <Button type="button" onClick={onRestart}>
        Responder de nuevo
      </Button>
    </div>
  );
}
