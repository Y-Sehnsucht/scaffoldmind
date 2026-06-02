import { Router } from 'express';
import { generateDeepDive } from '../services/aiService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const deepDiveRouter = Router();

deepDiveRouter.post('/', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['question', 'materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  if (!req.body.question?.question) {
    return sendValidationError(res, 'Missing required field: question.question');
  }

  try {
    const data = await generateDeepDive(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
