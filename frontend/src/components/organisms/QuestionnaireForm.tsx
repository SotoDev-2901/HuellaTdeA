import type { FormEvent } from 'react';
import { FiMonitor, FiTrash2, FiCoffee } from 'react-icons/fi';
import { PiPersonSimpleWalkBold } from 'react-icons/pi';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { OptionCard } from '../atoms/OptionCard';
import type { DietType, TransportMode } from '../../services/questionnaireService';

export interface QuestionnaireFormValues {
  transportMode: TransportMode | '';
  transportKmPerTrip: string;
  transportTripsPerWeek: string;
  deviceHoursPerDay: string;
  deviceDaysPerWeek: string;
  wasteKgPerWeek: string;
  dietType: DietType | '';
}

export type QuestionnaireErrors = Partial<Record<keyof QuestionnaireFormValues, string>> & {
  form?: string;
};

interface QuestionnaireFormProps {
  step: number;
  values: QuestionnaireFormValues;
  errors: QuestionnaireErrors;
  loading: boolean;
  onChange: <K extends keyof QuestionnaireFormValues>(field: K, value: QuestionnaireFormValues[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
  { value: 'caminar', label: 'Caminar' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'moto', label: 'Moto' },
  { value: 'carro', label: 'Carro' },
  { value: 'transporte_publico', label: 'T. público' },
];

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: 'vegano', label: 'Vegano' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'mixto_moderado', label: 'Mixto moderado' },
  { value: 'carne_frecuente', label: 'Carne frecuente' },
];

const STEPS = [
  {
    title: 'Transporte',
    icon: PiPersonSimpleWalkBold,
    tip: {
      heading: 'Tu movilidad impacta el campus',
      body: 'Al elegir medios sostenibles, contribuyes directamente a reducir la huella institucional.',
    },
  },
  {
    title: 'Dispositivos',
    icon: FiMonitor,
    tip: {
      heading: 'Eficiencia energética',
      body: 'El tiempo que usas equipos electrónicos influye directamente en tu huella de carbono.',
    },
  },
  {
    title: 'Residuos',
    icon: FiTrash2,
    tip: {
      heading: 'Cada kilo cuenta',
      body: 'Reducir y separar tus residuos disminuye las emisiones generadas en su disposición final.',
    },
  },
  {
    title: 'Alimentación',
    icon: FiCoffee,
    tip: {
      heading: 'Tus hábitos alimenticios',
      body: 'El tipo de dieta es uno de los factores que más pesa en la huella de carbono individual.',
    },
  },
];

export function QuestionnaireForm({
  step,
  values,
  errors,
  loading,
  onChange,
  onNext,
  onBack,
  onSubmit,
}: QuestionnaireFormProps) {
  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];
  const StepIcon = current.icon;

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLastStep) {
      onSubmit(event);
    } else {
      onNext();
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleFormSubmit}>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-tdea-green">
            Cuestionario
          </p>
          <span className="rounded-pill bg-tdea-blush px-2.5 py-0.5 text-xs font-medium text-graphite">
            Paso {step + 1} de {STEPS.length}
          </span>
        </div>
        <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-bold text-ink">
          <StepIcon className="text-tdea-green" />
          {current.title}
        </h2>
        <div className="mt-2 h-1.5 w-full rounded-pill bg-tdea-blush-border">
          <div
            className="h-1.5 rounded-pill bg-tdea-green transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {errors.form ? (
        <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{errors.form}</p>
      ) : null}

      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿Cuál es tu medio de transporte principal?
            </label>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_MODES.map((mode) => (
                <OptionCard
                  key={mode.value}
                  label={mode.label}
                  selected={values.transportMode === mode.value}
                  onClick={() => onChange('transportMode', mode.value)}
                />
              ))}
            </div>
            {errors.transportMode ? (
              <p className="mt-1 text-xs text-danger">{errors.transportMode}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Km promedio por trayecto"
              type="number"
              min={0}
              value={values.transportKmPerTrip}
              error={errors.transportKmPerTrip}
              onChange={(e) => onChange('transportKmPerTrip', e.target.value)}
            />
            <Input
              label="Trayectos por semana"
              type="number"
              min={0}
              value={values.transportTripsPerWeek}
              error={errors.transportTripsPerWeek}
              onChange={(e) => onChange('transportTripsPerWeek', e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Horas de uso de laptop/día"
            type="number"
            min={0}
            max={24}
            value={values.deviceHoursPerDay}
            error={errors.deviceHoursPerDay}
            onChange={(e) => onChange('deviceHoursPerDay', e.target.value)}
          />
          <Input
            label="Días de uso por semana"
            type="number"
            min={0}
            max={7}
            value={values.deviceDaysPerWeek}
            error={errors.deviceDaysPerWeek}
            onChange={(e) => onChange('deviceDaysPerWeek', e.target.value)}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <Input
            label="Kg de residuos que generas por semana"
            type="number"
            min={0}
            step="0.1"
            value={values.wasteKgPerWeek}
            error={errors.wasteKgPerWeek}
            onChange={(e) => onChange('wasteKgPerWeek', e.target.value)}
          />
          <p className="mt-1 text-xs text-silver">
            Referencia: una bolsa pequeña de basura ≈ 1-2 kg.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-graphite">
            ¿Cómo describirías tu alimentación?
          </label>
          <div className="flex flex-col gap-2">
            {DIET_TYPES.map((diet) => (
              <OptionCard
                key={diet.value}
                label={diet.label}
                selected={values.dietType === diet.value}
                onClick={() => onChange('dietType', diet.value)}
              />
            ))}
          </div>
          {errors.dietType ? <p className="mt-1 text-xs text-danger">{errors.dietType}</p> : null}
        </div>
      ) : null}

      <div className="rounded-input bg-tdea-green-dark p-4 text-white">
        <p className="text-sm font-semibold">{current.tip.heading}</p>
        <p className="mt-1 text-xs text-white/80">{current.tip.body}</p>
      </div>

      <div className="mt-1 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
          >
            ← Anterior
          </button>
        ) : null}
        <div className="flex-1">
          <Button type="submit" loading={loading}>
            {isLastStep ? 'Finalizar →' : 'Siguiente →'}
          </Button>
        </div>
      </div>
    </form>
  );
}
