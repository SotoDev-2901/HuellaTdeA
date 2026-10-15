import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import {
  QuestionnaireForm,
  type QuestionnaireErrors,
  type QuestionnaireFormValues,
} from '../components/organisms/QuestionnaireForm';
import { QuestionnaireResult } from '../components/organisms/QuestionnaireResult';
import { ApiError } from '../lib/api';
import * as questionnaireService from '../services/questionnaireService';
import type { QuestionnaireEligibility, QuestionnaireResponse } from '../services/questionnaireService';

const initialValues: QuestionnaireFormValues = {
  transportMode: '',
  transportKmPerTrip: '',
  transportMinutesPerTrip: '',
  transportDaysPerWeek: 5,
  campusHoursPerDay: '',
  campusSpaces: [],
  usesLaptop: null,
  chargesDevices: null,
  wasteFrequency: '',
  wasteComposition: [],
  eatingFrequency: '',
  dietType: '',
};

function validateStep(step: number, values: QuestionnaireFormValues): QuestionnaireErrors {
  const errors: QuestionnaireErrors = {};

  if (step === 0) {
    if (!values.transportMode) errors.transportMode = 'Selecciona un medio de transporte';
    if (values.transportKmPerTrip === '' || Number(values.transportKmPerTrip) < 0) {
      errors.transportKmPerTrip = 'Ingresa una distancia válida';
    }
  }

  if (step === 1) {
    if (values.campusHoursPerDay === '' || Number(values.campusHoursPerDay) < 0) {
      errors.campusHoursPerDay = 'Ingresa un número de horas válido';
    }
    if (values.usesLaptop === null) errors.usesLaptop = 'Selecciona una opción';
    if (values.chargesDevices === null) errors.chargesDevices = 'Selecciona una opción';
  }

  if (step === 2) {
    if (!values.eatingFrequency) errors.eatingFrequency = 'Selecciona una frecuencia';
    if (values.eatingFrequency && values.eatingFrequency !== 'nunca' && !values.dietType) {
      errors.dietType = 'Selecciona una opción';
    }
    if (!values.wasteFrequency) errors.wasteFrequency = 'Selecciona una frecuencia';
  }

  return errors;
}

export function QuestionnaireContainer() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<QuestionnaireFormValues>(initialValues);
  const [errors, setErrors] = useState<QuestionnaireErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuestionnaireResponse | null>(null);
  const [eligibility, setEligibility] = useState<QuestionnaireEligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    questionnaireService
      .getEligibility()
      .then(setEligibility)
      .finally(() => setCheckingEligibility(false));
  }, []);

  function handleChange<K extends keyof QuestionnaireFormValues>(
    field: K,
    value: QuestionnaireFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    const stepErrors = validateStep(step, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stepErrors = validateStep(step, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await questionnaireService.submitQuestionnaire({
        transportMode: values.transportMode as never,
        transportKmPerTrip: Number(values.transportKmPerTrip),
        transportMinutesPerTrip:
          values.transportMinutesPerTrip === '' ? undefined : Number(values.transportMinutesPerTrip),
        transportDaysPerWeek: values.transportDaysPerWeek,
        campusHoursPerDay: Number(values.campusHoursPerDay),
        campusSpaces: values.campusSpaces,
        usesLaptop: values.usesLaptop ?? false,
        chargesDevices: values.chargesDevices ?? false,
        wasteFrequency: values.wasteFrequency as never,
        wasteComposition: values.wasteComposition,
        eatingFrequency: values.eatingFrequency as never,
        dietType: (values.eatingFrequency !== 'nunca' ? values.dietType : 'mixto_moderado') as never,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEligibility({ canSubmit: false, nextEligibleDate: null });
      }
      setErrors({ form: err instanceof ApiError ? err.message : 'No se pudo guardar el cuestionario' });
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setValues(initialValues);
    setErrors({});
    setStep(0);
    setResult(null);
  }

  if (result) {
    return <QuestionnaireResult result={result} onRestart={handleRestart} />;
  }

  if (checkingEligibility) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando...</p>;
  }

  if (eligibility && !eligibility.canSubmit) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <FiCheckCircle className="text-tdea-green" size={40} />
        <h2 className="font-display text-xl font-bold text-ink">Ya respondiste este mes</h2>
        <p className="max-w-sm text-sm text-graphite">
          El cuestionario se responde una vez por mes para llevar un seguimiento real de tu huella
          en el tiempo.
          {eligibility.nextEligibleDate ? (
            <>
              {' '}
              Podrás volver a hacerlo a partir del{' '}
              <span className="font-semibold text-ink">
                {new Date(`${eligibility.nextEligibleDate}T00:00:00`).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              .
            </>
          ) : null}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-silver">
          <FiClock size={14} />
          Mientras tanto, revisa tu progreso en{' '}
          <Link to="/dashboard" className="font-medium text-tdea-green hover:underline">
            tu Dashboard
          </Link>{' '}
          o tu{' '}
          <Link to="/historial" className="font-medium text-tdea-green hover:underline">
            Historial
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <QuestionnaireForm
      step={step}
      values={values}
      errors={errors}
      loading={loading}
      onChange={handleChange}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  );
}
