import { calculateFootprint } from '../footprint/footprint.service.js';
import * as questionnaireRepository from './questionnaire.repository.js';
import type { SubmitQuestionnaireInput } from './questionnaire.schema.js';
import type { QuestionnaireResponse } from './questionnaire.types.js';

export async function submitQuestionnaire(
  userId: string,
  input: SubmitQuestionnaireInput,
): Promise<QuestionnaireResponse> {
  const result = calculateFootprint(input);
  return questionnaireRepository.createResponse(userId, input, result);
}

export function listMyResponses(userId: string): Promise<QuestionnaireResponse[]> {
  return questionnaireRepository.listResponsesByUser(userId);
}
