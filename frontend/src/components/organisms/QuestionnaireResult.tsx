import { Link } from 'react-router-dom';
import { FiCheck, FiClock } from 'react-icons/fi';
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

function LandscapeIllustration() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      <rect width="200" height="120" fill="var(--color-tdea-green-dark)" />
      <circle cx="150" cy="30" r="20" fill="var(--color-tdea-green-light)" opacity="0.6" />
      <path d="M0 90 L45 40 L80 75 L110 30 L150 80 L200 55 V120 H0 Z" fill="var(--color-tdea-green)" />
      <path d="M0 105 L60 70 L120 100 L200 80 V120 H0 Z" fill="var(--color-tdea-green-dark)" opacity="0.8" />
    </svg>
  );
}

export function QuestionnaireResult({ result, onRestart }: QuestionnaireResultProps) {
  const breakdown = {
    transporte: Number(result.transport_kg_co2e),
    instalaciones: Number(result.facilities_kg_co2e),
    dispositivos: Number(result.devices_kg_co2e),
    residuos: Number(result.waste_kg_co2e),
    alimentacion: Number(result.diet_kg_co2e),
  };
  const max = Math.max(...Object.values(breakdown));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tdea-green/10">
            <FiCheck className="text-tdea-green" size={24} />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold text-ink">¡Respuestas completadas!</h2>
          <p className="mt-1 text-sm text-graphite">
            Tu huella de carbono anual estimada es de{' '}
            <span className="font-bold text-tdea-green">{result.total_kg_co2e} kgCO2e</span>. Tu
            compromiso con la sostenibilidad es el primer paso hacia un futuro más verde.
          </p>
        </div>
        <div className="hidden overflow-hidden rounded-card shadow-soft sm:block">
          <LandscapeIllustration />
        </div>
      </div>

      <div className="rounded-input bg-tdea-blush p-4">
        <Row label="Transporte" value={breakdown.transporte} max={max} />
        <Row label="Instalaciones" value={breakdown.instalaciones} max={max} />
        <Row label="Dispositivos" value={breakdown.dispositivos} max={max} />
        <Row label="Residuos" value={breakdown.residuos} max={max} />
        <Row label="Alimentación" value={breakdown.alimentacion} max={max} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Link
          to="/historial"
          className="rounded-input border border-tdea-blush-border bg-tdea-blush p-4 transition-colors hover:border-tdea-green"
        >
          <FiClock className="text-tdea-green" size={18} />
          <p className="mt-2 text-sm font-semibold text-ink">Historial</p>
          <p className="mt-1 text-xs text-silver">Consulta tus registros anteriores.</p>
        </Link>
      </div>

      <Button type="button" onClick={onRestart}>
        Actualizar mis respuestas
      </Button>
      <p className="-mt-3 text-center text-xs text-silver">
        Si vuelves a responder, tus nuevas respuestas reemplazan las de este mes.
      </p>
    </div>
  );
}
