import { useState, type FormEvent } from 'react';
import {
  QuestionnaireForm,
  type QuestionnaireErrors,
  type QuestionnaireFormValues,
} from '../components/organisms/QuestionnaireForm';
import { QuestionnaireResult } from '../components/organisms/QuestionnaireResult';
import { ApiError } from '../lib/api';
import * as questionnaireService from '../services/questionnaireService';
import type { QuestionnaireResponse } from '../services/questionnaireService';

const initialValues: QuestionnaireFormValues = {
  transportMode: '',
  transportKmPerTrip: '',
  transportTripsPerWeek: '',
  deviceHoursPerDay: '',
  deviceDaysPerWeek: '',
  wasteKgPerWeek: '',
  dietType: '',
};

function validateStep(step: number, values: QuestionnaireFormValues): QuestionnaireErrors {
  const errors: QuestionnaireErrors = {};

  if (step === 0) {
    if (!values.transportMode) errors.transportMode = 'Selecciona un medio de transporte';
    if (values.transportKmPerTrip === '' || Number(values.transportKmPerTrip) < 0) {
      errors.transportKmPerTrip = 'Ingresa una distancia válida';
    }
    if (values.transportTripsPerWeek === '' || Number(values.transportTripsPerWeek) < 0) {
      errors.transportTripsPerWeek = 'Ingresa un número válido';
    }
  }

  if (step === 1) {
    if (values.deviceHoursPerDay === '' || Number(values.deviceHoursPerDay) < 0) {
      errors.deviceHoursPerDay = 'Ingresa un número de horas válido';
    }
    if (values.deviceDaysPerWeek === '' || Number(values.deviceDaysPerWeek) < 0) {
      errors.deviceDaysPerWeek = 'Ingresa un número de días válido';
    }
  }

  if (step === 2) {
    if (values.wasteKgPerWeek === '' || Number(values.wasteKgPerWeek) < 0) {
      errors.wasteKgPerWeek = 'Ingresa un peso válido';
    }
  }

  if (step === 3) {
    if (!values.dietType) errors.dietType = 'Selecciona una opción';
  }

  return errors;
}

export function QuestionnaireContainer() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<QuestionnaireFormValues>(initialValues);
  const [errors, setErrors] = useState<QuestionnaireErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuestionnaireResponse | null>(null);

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
        transportTripsPerWeek: Number(values.transportTripsPerWeek),
        deviceHoursPerDay: Number(values.deviceHoursPerDay),
        deviceDaysPerWeek: Number(values.deviceDaysPerWeek),
        wasteKgPerWeek: Number(values.wasteKgPerWeek),
        dietType: values.dietType as never,
      });
      setResult(response);
    } catch (err) {
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
