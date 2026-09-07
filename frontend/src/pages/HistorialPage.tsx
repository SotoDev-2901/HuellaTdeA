import { useEffect, useState } from 'react';
import { FiClock, FiEdit3, FiHome } from 'react-icons/fi';
import { AppShell, type NavItem } from '../components/organisms/AppShell';
import * as questionnaireService from '../services/questionnaireService';
import type { QuestionnaireResponse } from '../services/questionnaireService';

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, to: '/dashboard' },
  { label: 'Cuestionario', icon: FiEdit3, to: '/cuestionario' },
  { label: 'Historial', icon: FiClock, active: true },
];

const brand = { title: 'TDEA HUELLA', subtitle: 'Carbon Tracking' };

export function HistorialPage() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionnaireService
      .listMyResponses()
      .then(setResponses)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell navItems={navItems} brand={brand}>
      <div className="rounded-card bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-ink">Tus cuestionarios respondidos</h2>
        <p className="mt-1 text-sm text-graphite">
          Consulta tus registros anteriores para comparar tu impacto en el tiempo.
        </p>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-graphite">Cargando...</p>
          ) : responses.length === 0 ? (
            <p className="py-8 text-center text-sm text-graphite">
              Todavía no has respondido el cuestionario.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 font-medium">Transporte</th>
                  <th className="py-2 pr-4 font-medium">Dispositivos</th>
                  <th className="py-2 pr-4 font-medium">Residuos</th>
                  <th className="py-2 pr-4 font-medium">Alimentación</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-b border-tdea-blush-border/60">
                    <td className="py-3 pr-4 text-graphite">
                      {new Date(r.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-4">{r.transport_kg_co2e} kg</td>
                    <td className="py-3 pr-4">{r.devices_kg_co2e} kg</td>
                    <td className="py-3 pr-4">{r.waste_kg_co2e} kg</td>
                    <td className="py-3 pr-4">{r.diet_kg_co2e} kg</td>
                    <td className="py-3 pr-4 font-semibold text-tdea-green">{r.total_kg_co2e} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
