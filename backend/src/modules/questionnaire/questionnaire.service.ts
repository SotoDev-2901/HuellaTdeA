import { calculateFootprint } from '../footprint/footprint.service.js';
import * as questionnaireRepository from './questionnaire.repository.js';
import type { SubmitQuestionnaireInput } from './questionnaire.schema.js';
import type { QuestionnaireResponse } from './questionnaire.types.js';

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Primer día del mes siguiente al de `date`, en UTC — usado para informar cuándo se puede volver a responder. */
function firstDayOfNextMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export interface QuestionnaireEligibility {
  canSubmit: boolean;
  nextEligibleDate: string | null;
}

/**
 * `canSubmit` indica si se puede crear una respuesta NUEVA (una por mes calendario, decisión
 * explícita del usuario). Si ya respondió este mes, aún puede reenviar para reemplazarla. Coincide con la cadencia de "Evolución Mensual" del dashboard personal y con la
 * facturación mensual de HU-06, y evita que alguien envíe varias veces seguidas para manipular
 * la comparación contra el promedio TdeA (que usa la última respuesta de cada usuario).
 */
export async function getEligibility(userId: string): Promise<QuestionnaireEligibility> {
  const latest = await questionnaireRepository.findLatestResponseForUser(userId);
  if (!latest) {
    return { canSubmit: true, nextEligibleDate: null };
  }

  const now = new Date();
  const alreadyRespondedThisMonth = monthKey(new Date(latest.created_at)) === monthKey(now);
  if (!alreadyRespondedThisMonth) {
    return { canSubmit: true, nextEligibleDate: null };
  }

  return {
    canSubmit: false,
    nextEligibleDate: firstDayOfNextMonth(now).toISOString().slice(0, 10),
  };
}

export interface SubmitResult {
  response: QuestionnaireResponse;
  /** true si se reemplazó la respuesta del mes en curso en lugar de crear una nueva. */
  replaced: boolean;
}

/**
 * Hay una sola respuesta por mes calendario. Si la persona ya respondió este mes, volver a
 * enviar el cuestionario REEMPLAZA esa respuesta (conserva su fecha) en vez de crear otra o
 * rechazar el envío: así puede corregir sus hábitos sin inflar el historial ni manipular el
 * promedio TdeA con envíos repetidos.
 */
export async function submitQuestionnaire(userId: string, input: SubmitQuestionnaireInput): Promise<SubmitResult> {
  const footprintInput = { ...input, campusSpaces: input.campusSpaces ?? [] };
  const result = calculateFootprint(footprintInput);
  const extras = {
    transportMinutesPerTrip: input.transportMinutesPerTrip,
    campusSpaces: input.campusSpaces,
    wasteComposition: input.wasteComposition,
  };

  const latest = await questionnaireRepository.findLatestResponseForUser(userId);
  if (latest && monthKey(new Date(latest.created_at)) === monthKey(new Date())) {
    const response = await questionnaireRepository.replaceResponse(latest.id, userId, footprintInput, extras, result);
    return { response, replaced: true };
  }

  const response = await questionnaireRepository.createResponse(userId, footprintInput, extras, result);
  return { response, replaced: false };
}

export function listMyResponses(userId: string): Promise<QuestionnaireResponse[]> {
  return questionnaireRepository.listResponsesByUser(userId);
}
