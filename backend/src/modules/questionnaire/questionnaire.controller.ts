import type { Request, Response, NextFunction } from 'express';
import { submitQuestionnaireSchema } from './questionnaire.schema.js';
import * as questionnaireService from './questionnaire.service.js';

export async function submitQuestionnaireHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitQuestionnaireSchema.parse(req.body);
    const response = await questionnaireService.submitQuestionnaire(req.auth!.sub, input);
    res.status(201).json({ response });
  } catch (err) {
    next(err);
  }
}

export async function listMyResponsesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const responses = await questionnaireService.listMyResponses(req.auth!.sub);
    res.status(200).json({ responses });
  } catch (err) {
    next(err);
  }
}
