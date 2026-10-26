import { useEffect, useState, type FormEvent } from 'react';
import { FiSend, FiZap } from 'react-icons/fi';
import { Button } from '../components/atoms/Button';
import { ScenarioResult } from '../components/organisms/ScenarioResult';
import { ApiError } from '../lib/api';
import * as simulationService from '../services/simulationService';
import type { Lever, SimulationOptions, SimulationResult } from '../services/simulationService';

interface Outcome {
  result: SimulationResult;
  summary: string;
  interpretation?: string;
}

export function SimulatorContainer() {
  const [options, setOptions] = useState<SimulationOptions | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    simulationService
      .getOptions()
      .then(setOptions)
      .catch(() => setNotice('No se pudieron cargar las opciones del simulador.'));
  }, []);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    setNotice('');
    setLoading(true);
    try {
      const response = await simulationService.ask(question);
      if (response.understood && response.result && response.summary) {
        setOutcome({ result: response.result, summary: response.summary, interpretation: response.interpretation });
      } else {
        setOutcome(null);
        setNotice(response.reason ?? 'No pude entender la pregunta. Intenta ser más específico.');
      }
    } catch (err) {
      setOutcome(null);
      setNotice(err instanceof ApiError ? err.message : 'No se pudo completar la simulación.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExample(label: string, levers: Lever[]) {
    setNotice('');
    setQuestion(label);
    setLoading(true);
    try {
      const { result, summary } = await simulationService.runScenario(levers);
      setOutcome({ result, summary, interpretation: label });
    } catch (err) {
      setOutcome(null);
      setNotice(err instanceof ApiError ? err.message : 'No se pudo completar la simulación.');
    } finally {
      setLoading(false);
    }
  }

  const aiEnabled = options?.aiEnabled ?? true;

  return (
    <div className="grid max-w-4xl gap-4">
      <form onSubmit={handleAsk} className="rounded-card bg-surface p-4 sm:p-6 shadow-soft">
        <label htmlFor="pregunta" className="font-display text-lg font-bold text-ink">
          Pregunta lo que quieras
        </label>
        <p className="mt-1 text-sm text-graphite">
          Escribe un escenario con tus palabras y el simulador estima cómo cambiaría la huella del campus.
          Una IA entiende tu pregunta, pero los números los calcula el sistema con los mismos factores del cálculo oficial.
        </p>
        <textarea
          id="pregunta"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Ej.: ¿Qué pasa si el 40 % de quienes vienen en moto se pasan a la bicicleta?"
          className="mt-3 w-full rounded-input border border-tdea-blush-border bg-tdea-blush px-3 py-2.5 text-sm text-ink outline-none focus:border-tdea-green"
        />
        <div className="mt-1 flex items-center justify-between text-[11px] text-silver">
          <span>{question.length}/300</span>
          {!aiEnabled ? <span>La IA no está disponible: usa uno de los ejemplos.</span> : null}
        </div>
        <Button type="submit" loading={loading} disabled={!aiEnabled || question.trim().length < 8} className="mt-3 sm:w-auto">
          <FiSend size={16} /> Simular
        </Button>
      </form>

      {options && options.examples.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-silver">
            <FiZap size={13} /> Ejemplos para probar
          </p>
          <div className="flex flex-wrap gap-2">
            {options.examples.map((example) => (
              <button
                key={example.label}
                type="button"
                disabled={loading}
                onClick={() => handleExample(example.label, example.levers)}
                className="rounded-pill border border-tdea-blush-border bg-surface px-3 py-1.5 text-left text-xs text-graphite transition-colors hover:border-tdea-green hover:text-tdea-green disabled:opacity-60"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {notice ? <p className="rounded-input bg-danger-bg px-4 py-3 text-sm text-danger">{notice}</p> : null}

      {outcome ? <ScenarioResult result={outcome.result} summary={outcome.summary} interpretation={outcome.interpretation} /> : null}
    </div>
  );
}
