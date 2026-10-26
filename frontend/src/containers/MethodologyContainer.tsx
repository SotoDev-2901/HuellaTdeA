import { useEffect, useState } from 'react';
import * as methodologyService from '../services/methodologyService';
import type { Methodology, MethodologyFactor } from '../services/methodologyService';

function KindBadge({ kind }: { kind: MethodologyFactor['kind'] }) {
  return kind === 'official' ? (
    <span className="whitespace-nowrap rounded-pill bg-tdea-green/15 px-2 py-0.5 text-[11px] font-semibold text-tdea-green">
      Fuente publicada
    </span>
  ) : (
    <span className="whitespace-nowrap rounded-pill bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-graphite">
      Supuesto declarado
    </span>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-card bg-surface p-4 shadow-soft sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-graphite">{children}</div>
    </section>
  );
}

export function MethodologyContainer() {
  const [data, setData] = useState<Methodology | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    methodologyService
      .getMethodology()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="grid max-w-4xl gap-4">
      <Block title="Qué estimamos">
        <p>
          Tu huella es una <strong className="text-ink">estimación anual en kgCO₂e</strong> (kilogramos de dióxido de carbono
          equivalente) de lo que genera tu actividad <strong className="text-ink">dentro del campus</strong>. Se calcula
          con las respuestas del cuestionario y se escala por los días que realmente asistes: quien viene un día a la
          semana tiene una huella proporcionalmente menor que quien viene cinco.
        </p>
        <p>
          Es una aproximación para tomar conciencia y comparar, no una medición certificada. Por eso te mostramos
          cada supuesto que usamos.
        </p>
      </Block>

      {error ? (
        <p className="text-sm text-danger">No se pudo cargar el detalle del cálculo. Intenta de nuevo más tarde.</p>
      ) : data === null ? (
        <p className="py-6 text-center text-sm text-graphite">Cargando...</p>
      ) : (
        data.categories.map((category) => (
          <section key={category.id} className="min-w-0 rounded-card bg-surface p-4 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink">{category.label}</h2>
            <p className="mt-1 rounded-input bg-tdea-blush px-3 py-2 text-xs text-graphite">
              <span className="font-semibold text-ink">Fórmula: </span>
              {category.formula}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
                    <th className="py-2 pr-4 font-medium">Dato</th>
                    <th className="py-2 pr-4 font-medium">Valor</th>
                    <th className="py-2 pr-4 font-medium">Origen</th>
                    <th className="py-2 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {category.factors.map((factor) => (
                    <tr key={factor.key} className="border-b border-tdea-blush-border/60 align-top">
                      <td className="py-2 pr-4 font-medium text-ink">{factor.key}</td>
                      <td className="py-2 pr-4 text-graphite sm:whitespace-nowrap">{factor.value}</td>
                      <td className="py-2 pr-4 text-graphite">{factor.source}</td>
                      <td className="py-2">
                        <KindBadge kind={factor.kind} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <Block title="Huella institucional">
        <p>
          Para cada zona del campus: <span className="text-ink">kWh registrados × factor eléctrico + kg de residuos × factor de residuos</span>.
          Son los mismos factores del cálculo individual, así que ambos resultados son comparables.
        </p>
        <p>
          El transporte institucional no se mide directamente: se estima sumando el transporte de la última respuesta
          de cada persona. Es un supuesto declarado y por eso no entra en la variación interanual.
        </p>
      </Block>

      <Block title="Comparación con el promedio TdeA">
        <p>
          El promedio usa únicamente la <strong className="text-ink">última respuesta de cada persona</strong>, para que quien
          respondió muchas veces no pese más que quien respondió una sola vez.
        </p>
      </Block>

      <Block title="Recomendaciones">
        <p>
          Las recomendaciones las genera un modelo de lenguaje a partir de tus hábitos y tu huella. Nunca recibe tu nombre
          ni tu correo. Si el servicio no está disponible, se muestran recomendaciones predefinidas según la categoría
          donde más puedes mejorar.
        </p>
      </Block>

      <Block title="Simulador">
        <p>
          En el simulador escribes una pregunta con tus palabras. Una IA solo la traduce a cambios concretos (por ejemplo,
          “50 % de quienes usan carro pasan al bus”); los números los calcula el sistema con los mismos factores de esta
          página, sin azar: la misma pregunta siempre da el mismo resultado. Lo que la IA no pueda traducir se rechaza.
        </p>
      </Block>

      <Block title="Limitaciones">
        <p>
          Los valores marcados como supuesto declarado no provienen de una fuente oficial y deben ajustarse con
          mediciones reales. Las cifras individuales son estimaciones y sirven para comparar y tomar decisiones, no para
          reportes de cumplimiento.
        </p>
      </Block>
    </div>
  );
}
