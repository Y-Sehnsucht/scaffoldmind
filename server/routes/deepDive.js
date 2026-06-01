import { Router } from 'express';
import { buildMockDeepDive } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const deepDiveRouter = Router();

deepDiveRouter.post('/', (req, res) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['question', 'materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  if (!req.body.question?.question) {
    return sendValidationError(res, 'Missing required field: question.question');
  }

  return res.json(ok(buildMockDeepDive(req.body)));
});
