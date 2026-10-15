import type { Request, Response, NextFunction } from 'express';
import { submitQuestionnaireSchema } from './questionnaire.schema.js';
import * as questionnaireService from './questionnaire.service.js';

export async function submitQuestionnaireHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = submitQuestionnaireSchema.parse(req.body);
    const { response, replaced } = await questionnaireService.submitQuestionnaire(req.auth!.sub, input);
    res.status(replaced ? 200 : 201).json({ response, replaced });
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

export async function getEligibilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const eligibility = await questionnaireService.getEligibility(req.auth!.sub);
    res.status(200).json(eligibility);
  } catch (err) {
    next(err);
  }
}
