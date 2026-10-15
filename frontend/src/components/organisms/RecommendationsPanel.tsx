import { PiBicycleBold, PiPlugBold, PiRecycleBold } from 'react-icons/pi';
import type { PersonalFootprintBreakdown } from '../../services/dashboardService';

interface RecommendationsPanelProps {
  breakdown: PersonalFootprintBreakdown;
}

/**
 * Catálogo de recomendaciones fijo por categoría (no generado por IA — decisión explícita del
 * usuario: gratis, instantáneo y testeable). Se ordenan de mayor a menor huella para que la
 * primera tarjeta siempre corresponda a la categoría donde el usuario tiene más margen de mejora.
 */
const TIPS = {
  transporte: {
    icon: PiBicycleBold,
    title: 'Usa más la bici',
    description: 'Podrías reducir tu huella de transporte hasta un 20% este mes.',
  },
  energia: {
    icon: PiPlugBold,
    title: 'Apaga dispositivos',
    description: 'Desconectar equipos al salir del aula reduce el consumo "vampiro".',
  },
  residuos: {
    icon: PiRecycleBold,
    title: 'Reduce plásticos',
    description: 'Opta por envases reutilizables en las cafeterías del campus.',
  },
} as const;

export function RecommendationsPanel({ breakdown }: RecommendationsPanelProps) {
  const ordered = (['transporte', 'energia', 'residuos'] as const)
    .map((key) => ({ key, value: breakdown[`${key}_kg_co2e`] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Recomendaciones Personalizadas</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {ordered.map(({ key }) => {
          const tip = TIPS[key];
          return (
            <div key={key} className="rounded-input border border-tdea-blush-border bg-tdea-blush p-4">
              <tip.icon className="text-tdea-green" size={22} />
              <p className="mt-2 text-sm font-semibold text-ink">{tip.title}</p>
              <p className="mt-1 text-xs text-silver">{tip.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
