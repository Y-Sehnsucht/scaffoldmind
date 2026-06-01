import { Router } from 'express';
import { buildMockAnalysis } from '../services/mockLearningService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const analyzeRouter = Router();

analyzeRouter.post('/', (req, res) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  return res.json(ok(buildMockAnalysis(req.body)));
});
