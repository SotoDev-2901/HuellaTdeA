import { useEffect, useState } from 'react';
import { FiZap, FiTrash2, FiUsers, FiMapPin, FiInfo } from 'react-icons/fi';
import { EmissionsDonutChart } from '../components/organisms/EmissionsDonutChart';
import { MonthlyTrendChart } from '../components/organisms/MonthlyTrendChart';
import { ZoneRankingList } from '../components/organisms/ZoneRankingList';
import * as reportsService from '../services/reportsService';
import type { InstitutionalSummary } from '../services/reportsService';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiZap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card bg-surface p-5 shadow-soft card-hover">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-tdea-green" />
        <p className="text-xs font-semibold uppercase tracking-wide text-silver">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

export function InstitutionalSummaryContainer() {
  const [summary, setSummary] = useState<InstitutionalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsService
      .getInstitutionalSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando resumen institucional...</p>;
  }

  if (!summary) return null;

  const monthlyPoints = summary.monthly.map((m) => ({ month: m.month, total_kg_co2e: m.kg_co2e }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-card bg-tdea-green p-6 text-white shadow-soft card-hover">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Métrica principal</p>
          <h2 className="mt-1 font-display text-lg font-bold">Huella Total del Campus</h2>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-3xl font-bold">
              {(summary.totalKgCo2e / 1000).toFixed(1)} <span className="text-base font-medium">tCO2e</span>
            </p>
            {summary.yearOverYearPct !== null ? (
              <span
                className={`mb-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                  summary.yearOverYearPct <= 0 ? 'bg-white/20' : 'bg-danger/30'
                }`}
              >
                {summary.yearOverYearPct <= 0 ? '↘' : '↗'} {Math.abs(summary.yearOverYearPct)}% vs año anterior
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-white/70">Últimos 12 meses (energía + residuos + transporte reportado)</p>
        </div>

        <div className="rounded-card bg-tdea-green-dark p-6 text-white shadow-soft card-hover">
          <div className="flex items-center gap-2">
            <FiInfo size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Insight Clave</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            {summary.insight ?? 'Todavía no hay suficientes datos por zona para identificar un insight.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiZap} label="Consumo Energético" value={`${summary.totalKwh.toLocaleString('es-CO')} kWh`} />
        <StatCard icon={FiTrash2} label="Residuos Generados" value={`${summary.totalWasteKg.toLocaleString('es-CO')} kg`} />
        <StatCard
          icon={FiUsers}
          label="Promedio por Persona"
          value={`${(summary.averagePerPersonKgCo2e / 1000).toFixed(2)} tCO2e`}
        />
        <StatCard icon={FiMapPin} label="Zonas Monitoreadas" value={`${summary.zonesMonitored} zonas`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
          <h2 className="font-display text-lg font-bold text-ink">Evolución Institucional</h2>
          <div className="mt-4">
            <MonthlyTrendChart points={monthlyPoints} />
          </div>
        </div>

        <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
          <h2 className="font-display text-lg font-bold text-ink">Distribución por Categoría</h2>
          <div className="mt-4">
            <EmissionsDonutChart
              totalLabel={`${(summary.totalKgCo2e / 1000).toFixed(1)}`}
              unit="kgCO2e"
              segments={[
                { label: 'Transporte', value: summary.distribution.transporte, colorVar: 'var(--color-tdea-green-dark)' },
                { label: 'Energía', value: summary.distribution.energia, colorVar: 'var(--color-tdea-green)' },
                { label: 'Residuos', value: summary.distribution.residuos, colorVar: 'var(--color-tdea-green-light)' },
              ]}
            />
          </div>
          <p className="mt-3 text-xs text-silver">
            Transporte proviene de la última respuesta del cuestionario individual de cada usuario (supuesto
            declarado — no hay medición institucional directa de transporte).
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
          <h2 className="font-display text-lg font-bold text-ink">Top Zonas con Mayor Huella</h2>
          <div className="mt-4">
            <ZoneRankingList zones={summary.topZones} />
          </div>
        </div>

        <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
          <h2 className="font-display text-lg font-bold text-ink">Composición de Residuos</h2>
          <div className="mt-4">
            {summary.wasteComposition.plastico + summary.wasteComposition.papel + summary.wasteComposition.organico >
            0 ? (
              <EmissionsDonutChart
                totalLabel={`${(
                  summary.wasteComposition.plastico +
                  summary.wasteComposition.papel +
                  summary.wasteComposition.organico
                ).toFixed(0)}`}
                unit="kg"
                segments={[
                  { label: 'Plástico', value: summary.wasteComposition.plastico, colorVar: 'var(--color-tdea-green-dark)' },
                  { label: 'Papel', value: summary.wasteComposition.papel, colorVar: 'var(--color-tdea-green)' },
                  { label: 'Orgánico', value: summary.wasteComposition.organico, colorVar: 'var(--color-tdea-green-light)' },
                ]}
              />
            ) : (
              <p className="py-8 text-center text-sm text-graphite">
                Todavía no hay residuos clasificados por tipo en los últimos 12 meses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
