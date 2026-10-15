import { useEffect, useState } from 'react';
import { PiBicycleBold, PiPlugBold, PiRecycleBold, PiSparkleBold } from 'react-icons/pi';
import * as dashboardService from '../../services/dashboardService';
import type { PersonalFootprintBreakdown, Recommendation, RecommendationsResult } from '../../services/dashboardService';

interface RecommendationsPanelProps {
  breakdown: PersonalFootprintBreakdown;
}

const ICONS = {
  transporte: PiBicycleBold,
  energia: PiPlugBold,
  residuos: PiRecycleBold,
} as const;

/** Catálogo local, solo se usa si la API de recomendaciones no responde. */
const FALLBACK_TIPS: Record<Recommendation['category'], Omit<Recommendation, 'category'>> = {
  transporte: {
    title: 'Usa más la bici',
    description: 'Cambiar algunos trayectos en carro o moto por bicicleta o transporte público reduce tu huella de transporte.',
  },
  energia: {
    title: 'Apaga dispositivos',
    description: 'Desconectar equipos y apagar luces al salir del aula reduce el consumo "vampiro".',
  },
  residuos: {
    title: 'Reduce plásticos',
    description: 'Opta por envases reutilizables en las cafeterías del campus y separa tus residuos.',
  },
};

function localFallback(breakdown: PersonalFootprintBreakdown): RecommendationsResult {
  const items = (['transporte', 'energia', 'residuos'] as const)
    .map((category) => ({ category, value: breakdown[`${category}_kg_co2e`] }))
    .sort((a, b) => b.value - a.value)
    .map(({ category }) => ({ category, ...FALLBACK_TIPS[category] }));
  return { hasResponses: true, source: 'rules', items };
}

export function RecommendationsPanel({ breakdown }: RecommendationsPanelProps) {
  const [result, setResult] = useState<RecommendationsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    dashboardService
      .getRecommendations()
      .then((r) => {
        if (!cancelled) setResult(r.items.length > 0 ? r : localFallback(breakdown));
      })
      .catch(() => {
        if (!cancelled) setResult(localFallback(breakdown));
      });
    return () => {
      cancelled = true;
    };
  }, [breakdown]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-bold text-ink">Recomendaciones Personalizadas</h2>
        {result?.source === 'ai' ? (
          <span className="flex items-center gap-1 rounded-pill bg-tdea-green/15 px-2 py-0.5 text-[11px] font-semibold text-tdea-green">
            <PiSparkleBold size={12} /> Generadas con IA
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {result === null
          ? [0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-input border border-tdea-blush-border bg-tdea-blush" />
            ))
          : result.items.map((tip) => {
              const Icon = ICONS[tip.category];
              return (
                <div key={tip.category} className="rounded-input border border-tdea-blush-border bg-tdea-blush p-4">
                  <Icon className="text-tdea-green" size={22} />
                  <p className="mt-2 text-sm font-semibold text-ink">{tip.title}</p>
                  <p className="mt-1 text-xs text-silver">{tip.description}</p>
                </div>
              );
            })}
      </div>
    </div>
  );
}
