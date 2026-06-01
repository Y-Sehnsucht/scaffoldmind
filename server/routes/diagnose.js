import { Router } from 'express';
import { buildMockDiagnosis } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const diagnoseRouter = Router();

diagnoseRouter.post('/', (req, res) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['question', 'userAttempt'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  return res.json(ok(buildMockDiagnosis(req.body)));
});
