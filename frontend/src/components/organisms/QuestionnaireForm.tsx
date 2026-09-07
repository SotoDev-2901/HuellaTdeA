import type { FormEvent } from 'react';
import {
  PiPersonSimpleWalkBold,
  PiBicycleBold,
  PiMotorcycleBold,
  PiCarSimpleBold,
  PiBusBold,
} from 'react-icons/pi';
import { FiCoffee, FiTrash2 } from 'react-icons/fi';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { OptionCard } from '../atoms/OptionCard';
import { IconOptionCard } from '../atoms/IconOptionCard';
import { Slider } from '../atoms/Slider';
import { Checkbox } from '../atoms/Checkbox';
import type {
  CampusSpace,
  DietType,
  TransportMode,
  WasteComponent,
  WasteFrequency,
} from '../../services/questionnaireService';

export interface QuestionnaireFormValues {
  transportMode: TransportMode | '';
  transportKmPerTrip: string;
  transportMinutesPerTrip: string;
  transportDaysPerWeek: number;
  campusHoursPerDay: string;
  campusSpaces: CampusSpace[];
  usesLaptop: boolean | null;
  chargesDevices: boolean | null;
  wasteFrequency: WasteFrequency | '';
  wasteComposition: WasteComponent[];
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

const TRANSPORT_MODES: { value: TransportMode; label: string; icon: typeof PiBusBold }[] = [
  { value: 'caminar', label: 'Caminar', icon: PiPersonSimpleWalkBold },
  { value: 'bicicleta', label: 'Bicicleta', icon: PiBicycleBold },
  { value: 'moto', label: 'Moto', icon: PiMotorcycleBold },
  { value: 'carro', label: 'Carro', icon: PiCarSimpleBold },
  { value: 'transporte_publico', label: 'T. Público', icon: PiBusBold },
];

const CAMPUS_SPACES: { value: CampusSpace; label: string }[] = [
  { value: 'aulas', label: 'Aulas' },
  { value: 'biblioteca', label: 'Biblioteca' },
  { value: 'laboratorios', label: 'Laboratorios' },
];

const WASTE_FREQUENCIES: { value: WasteFrequency; label: string; description: string }[] = [
  { value: 'baja', label: 'Baja', description: 'Residuos ocasionales, uso de termos' },
  { value: 'media', label: 'Media', description: 'Generación diaria regular' },
  { value: 'alta', label: 'Alta', description: 'Múltiples envases y papeles diarios' },
];

const WASTE_COMPONENTS: { value: WasteComponent; label: string }[] = [
  { value: 'plastico', label: 'Plástico' },
  { value: 'papel', label: 'Papel' },
  { value: 'organico', label: 'Orgánico' },
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
    tip: {
      heading: 'Tu movilidad impacta el campus',
      body: 'Al elegir medios sostenibles, contribuyes directamente a reducir la huella institucional.',
    },
  },
  {
    title: 'Uso de instalaciones',
    tip: {
      heading: 'Eficiencia energética',
      body: 'El tiempo que usas equipos electrónicos influye directamente en tu huella de carbono.',
    },
  },
  {
    title: 'Residuos y alimentación',
    tip: {
      heading: 'Cada hábito cuenta',
      body: 'Lo que consumes y desechas es una de las fuentes más grandes de tu huella individual.',
    },
  },
];

function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

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
        <h2 className="mt-1 font-display text-xl font-bold text-ink">{current.title}</h2>
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
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿Cuál es tu medio de transporte principal?
            </label>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_MODES.map((mode) => (
                <IconOptionCard
                  key={mode.value}
                  icon={mode.icon}
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

          <Slider
            label="¿Cuántos días asistes?"
            min={1}
            max={7}
            value={values.transportDaysPerWeek}
            minLabel="1 día"
            maxLabel="7 días"
            onChange={(v) => onChange('transportDaysPerWeek', v)}
          />

          <div>
            <p className="mb-1.5 text-sm font-medium text-graphite">Promedio por trayecto</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Distancia estimada (km)"
                type="number"
                min={0}
                placeholder="Ej: 5.5"
                value={values.transportKmPerTrip}
                error={errors.transportKmPerTrip}
                onChange={(e) => onChange('transportKmPerTrip', e.target.value)}
              />
              <Input
                label="Tiempo estimado (min)"
                type="number"
                min={0}
                placeholder="Ej: 30"
                value={values.transportMinutesPerTrip}
                onChange={(e) => onChange('transportMinutesPerTrip', e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <Input
            label="¿Cuántas horas al día permaneces en la universidad?"
            type="number"
            min={0}
            max={24}
            placeholder="Ej: 6"
            value={values.campusHoursPerDay}
            error={errors.campusHoursPerDay}
            onChange={(e) => onChange('campusHoursPerDay', e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿En qué espacios pasas más tiempo?
            </label>
            <div className="flex flex-col gap-2">
              {CAMPUS_SPACES.map((space) => (
                <Checkbox
                  key={space.value}
                  label={space.label}
                  checked={values.campusSpaces.includes(space.value)}
                  onChange={() => onChange('campusSpaces', toggleInArray(values.campusSpaces, space.value))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿Usas computador portátil?
            </label>
            <div className="flex gap-3">
              <OptionCard
                label="Sí"
                selected={values.usesLaptop === true}
                onClick={() => onChange('usesLaptop', true)}
              />
              <OptionCard
                label="No"
                selected={values.usesLaptop === false}
                onClick={() => onChange('usesLaptop', false)}
              />
            </div>
            {errors.usesLaptop ? <p className="mt-1 text-xs text-danger">{errors.usesLaptop}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿Cargas dispositivos en la universidad?
            </label>
            <div className="flex gap-3">
              <OptionCard
                label="Sí"
                selected={values.chargesDevices === true}
                onClick={() => onChange('chargesDevices', true)}
              />
              <OptionCard
                label="No"
                selected={values.chargesDevices === false}
                onClick={() => onChange('chargesDevices', false)}
              />
            </div>
            {errors.chargesDevices ? (
              <p className="mt-1 text-xs text-danger">{errors.chargesDevices}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-graphite">
              <FiCoffee /> ¿Cómo describirías tu alimentación?
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

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-graphite">
              <FiTrash2 /> ¿Con qué frecuencia generas residuos?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_FREQUENCIES.map((freq) => (
                <button
                  type="button"
                  key={freq.value}
                  onClick={() => onChange('wasteFrequency', freq.value)}
                  className={`rounded-input border px-2.5 py-3 text-left text-xs transition-colors ${
                    values.wasteFrequency === freq.value
                      ? 'border-tdea-green bg-tdea-green/10'
                      : 'border-tdea-blush-border bg-tdea-blush'
                  }`}
                >
                  <p className="font-semibold text-ink">{freq.label}</p>
                  <p className="mt-0.5 text-silver">{freq.description}</p>
                </button>
              ))}
            </div>
            {errors.wasteFrequency ? (
              <p className="mt-1 text-xs text-danger">{errors.wasteFrequency}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">
              ¿Qué tipo de residuos generas más? (Selecciona todos los que apliquen)
            </label>
            <div className="flex flex-col gap-2">
              {WASTE_COMPONENTS.map((component) => (
                <Checkbox
                  key={component.value}
                  label={component.label}
                  checked={values.wasteComposition.includes(component.value)}
                  onChange={() =>
                    onChange('wasteComposition', toggleInArray(values.wasteComposition, component.value))
                  }
                />
              ))}
            </div>
          </div>
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
