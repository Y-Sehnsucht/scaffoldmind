import { Router } from 'express';
import { generateDiagnosis } from '../services/aiService.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const diagnoseRouter = Router();

diagnoseRouter.post('/', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['question', 'userAttempt'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await generateDiagnosis(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});
