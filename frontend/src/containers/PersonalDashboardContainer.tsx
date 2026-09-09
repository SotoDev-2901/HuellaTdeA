import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiZap, FiTrash2 } from 'react-icons/fi';
import { EmissionsDonutChart } from '../components/organisms/EmissionsDonutChart';
import { MonthlyTrendChart } from '../components/organisms/MonthlyTrendChart';
import { TdeaComparisonBar } from '../components/organisms/TdeaComparisonBar';
import { RecommendationsPanel } from '../components/organisms/RecommendationsPanel';
import * as dashboardService from '../services/dashboardService';
import type { PersonalDashboard } from '../services/dashboardService';

function StatCard({
  icon: Icon,
  label,
  valueKg,
  highlight,
}: {
  icon: typeof FiTruck;
  label: string;
  valueKg: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-card p-5 shadow-soft ${
        highlight ? 'bg-tdea-green text-white' : 'bg-surface text-ink'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={highlight ? 'text-white/80' : 'text-tdea-green'} />
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            highlight ? 'text-white/80' : 'text-silver'
          }`}
        >
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-bold">
        {(valueKg / 1000).toFixed(2)} <span className="text-sm font-medium">tCO2e</span>
      </p>
    </div>
  );
}

export function PersonalDashboardContainer() {
  const [data, setData] = useState<PersonalDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getPersonalDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando tu huella...</p>;
  }

  if (!data || !data.hasResponses || !data.latest) {
    return (
      <div className="rounded-card bg-surface p-8 text-center shadow-soft">
        <h2 className="font-display text-lg font-bold text-ink">Aún no tienes datos</h2>
        <p className="mt-2 text-sm text-graphite">
          Responde el cuestionario de huella individual para ver aquí tu huella personal.
        </p>
        <Link
          to="/cuestionario"
          className="mt-4 inline-block rounded-button bg-tdea-green px-4 py-2.5 text-sm font-bold text-white hover:bg-tdea-green-dark"
        >
          Responder cuestionario
        </Link>
      </div>
    );
  }

  const { latest, previousTotalKgCo2e, monthly, tdeaAverageKgCo2e } = data;
  const deltaKg = previousTotalKgCo2e !== null ? latest.total_kg_co2e - previousTotalKgCo2e : null;
  const diffVsAveragePct =
    tdeaAverageKgCo2e > 0
      ? Math.round(((tdeaAverageKgCo2e - latest.total_kg_co2e) / tdeaAverageKgCo2e) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {tdeaAverageKgCo2e > 0 ? (
        <div
          className={`rounded-input px-4 py-2.5 text-sm font-medium ${
            diffVsAveragePct >= 0 ? 'bg-tdea-green/10 text-tdea-green' : 'bg-danger-bg text-danger'
          }`}
        >
          {diffVsAveragePct >= 0
            ? `¡Vas por buen camino! Estás un ${diffVsAveragePct}% por debajo del promedio`
            : `Estás un ${Math.abs(diffVsAveragePct)}% por encima del promedio TdeA`}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={FiZap} label="Huella personal total" valueKg={latest.total_kg_co2e} highlight />
        <StatCard icon={FiTruck} label="Transporte" valueKg={latest.transporte_kg_co2e} />
        <StatCard icon={FiZap} label="Energía" valueKg={latest.energia_kg_co2e} />
        <StatCard icon={FiTrash2} label="Residuos" valueKg={latest.residuos_kg_co2e} />
      </div>
      {deltaKg !== null ? (
        <p className="-mt-3 text-xs text-graphite">
          {deltaKg <= 0 ? '↘' : '↗'} {(Math.abs(deltaKg) / 1000).toFixed(2)} tCO2e{' '}
          {deltaKg <= 0 ? 'menos' : 'más'} que tu respuesta anterior
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-ink">Distribución de Emisiones</h2>
          <div className="mt-4">
            <EmissionsDonutChart
              totalLabel={`${(latest.total_kg_co2e / 1000).toFixed(1)}`}
              segments={[
                { label: 'Transporte', value: latest.transporte_kg_co2e, colorVar: 'var(--color-tdea-green-dark)' },
                { label: 'Energía', value: latest.energia_kg_co2e, colorVar: 'var(--color-tdea-green)' },
                { label: 'Residuos', value: latest.residuos_kg_co2e, colorVar: 'var(--color-tdea-green-light)' },
              ]}
            />
          </div>
        </div>

        <div className="rounded-card bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-ink">Evolución Mensual</h2>
          <div className="mt-4">
            <MonthlyTrendChart points={monthly} />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Tú vs Promedio TdeA</h2>
        <TdeaComparisonBar personalKgCo2e={latest.total_kg_co2e} averageKgCo2e={tdeaAverageKgCo2e} />
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <RecommendationsPanel breakdown={latest} />
      </div>
    </div>
  );
}
