import { AppError } from '../../shared/errors/AppError.js';
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
 * El cuestionario solo se puede responder una vez por mes calendario (decisión explícita del
 * usuario): coincide con la cadencia de "Evolución Mensual" del dashboard personal y con la
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

export async function submitQuestionnaire(
  userId: string,
  input: SubmitQuestionnaireInput,
): Promise<QuestionnaireResponse> {
  const eligibility = await getEligibility(userId);
  if (!eligibility.canSubmit) {
    throw new AppError(
      `Ya respondiste el cuestionario este mes. Podrás volver a hacerlo a partir del ${eligibility.nextEligibleDate}.`,
      409,
    );
  }

  const result = calculateFootprint({ ...input, campusSpaces: input.campusSpaces ?? [] });
  return questionnaireRepository.createResponse(
    userId,
    input,
    {
      transportMinutesPerTrip: input.transportMinutesPerTrip,
      campusSpaces: input.campusSpaces,
      wasteComposition: input.wasteComposition,
    },
    result,
  );
}

export function listMyResponses(userId: string): Promise<QuestionnaireResponse[]> {
  return questionnaireRepository.listResponsesByUser(userId);
}
